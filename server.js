var mainServer = require('socket.io-client')('http://192.168.86.89:3000');
var moment = require('moment');
mainServer.on('connect', function(){
    console.log("CONNECTED");
    });
var fileNameTImeStamp = moment().format("YYYY-MM-DD_HH:mm:ss");
var name = fileNameTImeStamp + ".mp4" + "|http://208.113.164.242:3000/publish"
var spawn=require('child_process').spawn
, child=null;
    mainServer.on('bodyCam', function(data){
        console.log("40:  " + data)
    if(data==="START"){
        child=spawn("ffmpeg", [
            "-ar", "44100", "-ac", "1", 
            "-f", "alsa",
             "-i", "hw:1", 
            "-f", "v4l2", 
            "-c:v", "h264", "-r", "30", 
            "-s", "1280x720", "-itsoffset", "0.5",
             "-i", "/dev/video0",
             "-copyinkf", "-codec:v", "copy", "-codec:a", "aac", 
             "-ab", "128k", "-g", "10", name
            ]);
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stdout);
            child.on('exit', function () {
            console.log("exited") 
            });
    }
    if(data==="STOP"){
        child.kill('SIGINT');
    }
    });




