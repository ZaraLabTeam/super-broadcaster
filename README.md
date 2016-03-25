# Super Youtube Broadcaster - One click do it all

## Info

Broadcast live (well almost) to your channel in youtoube 

## But how is this possible?

This project is setup to start on a linux machine 
you must have the [libav](https://libav.org/avconv.html) package installed
or else it won't run.

The other steps are easier just run `npm install` in the project root
then create a file screts.json use this as example
```json
{
	"youtubeKey": "the key from you channel",
	"serverPass": "set a pass to control the server"
}
``` 

Next run `npm start` 
to start broadcasting access [localhost:8002](localhost:8002);
and pick a configuration from the menu and click on the start button