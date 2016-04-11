'use strict';

var spawn = require('child_process').spawn;
var AvStream = require('./avstream');

module.exports = function ffmpeg(params) {
    var stream = new AvStream(),
        // todo: use a queue to deal with the spawn EMFILE exception
        // see http://www.runtime-era.com/2012/10/quick-and-dirty-nodejs-exec-limit-queue.html
        // currently I have added a dirty workaround on the server by increasing
        // the file max descriptor with 'sudo sysctl -w fs.file-max=100000'
        ffmpeg = spawn('ffmpeg', params);

    // General ffmpeg output is always written into stderr
    if (ffmpeg.stderr) {

        ffmpeg.stderr.setEncoding('utf8');

        var output = '',
            duration,
            time,
            progress;

        ffmpeg.stderr.on('data', function(data) {

            time = null;

            // Keep the output so that we can parse stuff anytime,
            // i.E. duration or meta data
            output += data;

            if (!duration) {
                duration = findDuration(output);
            } else {
                time = findTime(data);
            }

            if (duration && time) {
                progress = time / duration;

                if (progress > 1) {
                    progress = 1; // Fix floating point error
                }

                // Tell the world that progress is made
                stream.emit('progress', progress);
            }

            // Emit conversion information as messages
            stream.emit('message', data);
        });
    }

    // When ffmpeg outputs anything to stdout, it's probably converted data
    if (ffmpeg.stdout) {
        ffmpeg.stdout.on('data', function(data) {
            stream.push(data);
        });
    }

    // Pipe the stream to ffmpeg standard input
    if (ffmpeg.stdin) {

        // Reduce overhead when receiving a pipe
        stream.on('pipe', function(source) {

            // Unpipe the source (input) stream from AvStream
            source.unpipe(stream);

            // And pipe it to ffmpeg's stdin instead
            source.pipe(ffmpeg.stdin);
        });

        // When data is written to AvStream, send it to ffmpeg's stdin
        stream.on('inputData', function(data) {
            ffmpeg.stdin.write(data);
        });
    }

    ffmpeg.on('error', function(data) {
        stream.emit('error', data);
    });

    // New stdio api introduced the exit event not waiting for open pipes
    var eventType = ffmpeg.stdio ? 'close' : 'exit';

    ffmpeg.on(eventType, function(exitCode, signal) {
        stream.end();
        stream.emit('exit', exitCode, signal);
    });

    stream.kill = function() {
        ffmpeg.kill();
    };

    return stream;
};

function findDuration(data) {
    var result = /duration: (\d+:\d+:\d+.\d+)/i.exec(data),
        duration;

    if (result && result[1]) {
        duration = toMilliSeconds(result[1]);
    }

    return duration;
}

function findTime(data) {
    var time;

    if (data.substring(0, 5) === 'frame') {
        var result = /time=(\d+.\d+)/i.exec(data);

        if (result && result[1]) {
            time = toMilliSeconds(result[1]);
        }
    }

    return time;
}

function toMilliSeconds(time) {
    var d  = time.split(/[:.]/),
        ms = 0;

    if (d.length === 4) {
        ms += parseInt(d[0], 10) * 3600 * 1000;
        ms += parseInt(d[1], 10) * 60 * 1000;
        ms += parseInt(d[2], 10) * 1000;
        ms += parseInt(d[3], 10) * 10;
    } else {
        ms += parseInt(d[0], 10) * 1000;
        ms += parseInt(d[1], 10);
    }

    return ms;
}