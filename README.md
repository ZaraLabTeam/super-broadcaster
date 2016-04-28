# Super Youtube Broadcaster - One click do it all

## Info

Broadcast live (well almost ~15sec) to your channel in youtoube
or anywhere else you might want to

## But how is this possible?

This project is setup to start on a linux machine 
it requires that you have **ffmpeg** installed.

if you have the [libav](https://libav.org/avconv.html) package installed, you can use that instead

also `sudo apt-get install libasound2-dev`

The other steps are easier just run `npm install` and `bower install` in the project root then create a file screts.json use this as example
```json
{
	"output": "{{youtube chanel}}/{{the key for you channel}}",
	"serverPass": "set a pass to control the server"
}
``` 

If you want to serve over *https* just put `server.crt` and `server.key` in the `config/` directory

Next run `npm start` 
to start broadcasting access [localhost:8002](localhost:8002), 
pick a configuration from the menu and click on the start button

Next time you can run `spm start auto` this will start broadcasting with the last used configuration

## ffmpeg/avconv Settings 

You must set a default output in the secrets.json, but it can be overriden in the preset configuration by setting an  output different from 'default'

If you are using **libx264** codec start with -vcodec libx264 -preset **ultrafast** this is the least stresfull preset then superfast, fast and so on until superslow, each step adds twice as much demand on the cpu 

You can stream audio to the nodejs server from the webApp and then merge it with the video stream by specifying audio input as **pipe:** `...-f mp3 -i pipe:1 ...` then audio will be fetched from the webApp, you may need to sync the audio and video streams with some ffmpeg configuration options

## raspberry pi

To use on raspberry pi with the **raspivid** camera you can pipe two or more streams together 
using ` | ` as separator.
Example preset:
```
{
	"name": "yt1080p",
	"command": "raspivid -t 0 -n -w 1920 -h 1080 -fps 30 -b 4500000 -vf -rot 0 -o - | ffmpeg -r 30 -f h264 -thread_queue_size 512 -i - -f mp3 -thread_queue_size 512 -i pipe:1 -vcodec copy -ar 44100 -f flv",
	"output": "default"
}
```
This will start and manage 2 processes: **raspivid** and **ffmpeg** and pipe the former's **data** output to the latter's input

## running with `forever`

To run with `forever` install `npm install -g forever` 
Run the server normally experiment and select a preset then start the process like this
`forever start --killSignal=SIGTERM server.js auto`
to stop use `forever stop server.js` this way you ensure node will terminate the child processes (ffmpeg) it started (by running a cleanup scirpt and exiting)

## Resources And References Used To Create This App

* [Speech To Server](https://github.com/akrennmair/speech-to-server)
* [node (socket) live audio stream / broadcast](http://stackoverflow.com/questions/23396575/node-socket-live-audio-stream-broadcast)
* [Recording MP3 Using Only HTML5 and JavaScript](http://audior.ec/blog/recording-mp3-using-only-html5-and-javascript-recordmp3-js/)
* [lamejs](https://github.com/zhuker/lamejs)
* [Getting Started with Web Audio API](http://www.html5rocks.com/en/tutorials/webaudio/intro/)
* for previouse version using avconv [avconv Documentation](https://libav.org/avconv.html)

