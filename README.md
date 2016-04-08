# Super Youtube Broadcaster - One click do it all

## Info

Broadcast live (well almost ~30sec) to your channel in youtoube 

## But how is this possible?

This project is setup to start on a linux machine 
you must have the [libav](https://libav.org/avconv.html) package installed
or else it won't run.

also `sudo apt-get install libasound2-dev`

The other steps are easier just run `npm install` in the project root
then create a file screts.json use this as example
```json
{
	"output": "{{youtube chanel}}/{{the key for you channel}}",
	"serverPass": "set a pass to control the server"
}
``` 

Next run `npm start` 
to start broadcasting access [localhost:8002](localhost:8002), 
pick a configuration from the menu and click on the start button

## Avconv Settings 

You must set a default output in the secrets.json, but it can be overriden in the preset configuration by setting an  output different from 'default'

If you are using **libx264** codec start with -vcodec libx264 -preset **ultrafast** this is the least stresfull preset then superfast, fast and so on until superslow, each step adds twice as much demand on the cpu 

You can stream audio to the nodejs server from the webApp and then merge it with the video stream
	* using **pulse audio**: To check you input/output source use `pactl list sources | grep Name` to stream your speakers audio use the `alsa_output ... .monitor` source and `-f pulse` option
	* using **jack** create a jack and use as an input 

## Resources And References Used To Create This App

* [Speech To Server](https://github.com/akrennmair/speech-to-server)
* [node (socket) live audio stream / broadcast](http://stackoverflow.com/questions/23396575/node-socket-live-audio-stream-broadcast)
* [Recording MP3 Using Only HTML5 and JavaScript](http://audior.ec/blog/recording-mp3-using-only-html5-and-javascript-recordmp3-js/)
* [lamejs](https://github.com/zhuker/lamejs)
* [Getting Started with Web Audio API](http://www.html5rocks.com/en/tutorials/webaudio/intro/)
* [avconv Documentation](https://libav.org/avconv.html)