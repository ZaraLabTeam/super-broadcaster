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
