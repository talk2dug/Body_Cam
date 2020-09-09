var mainServer = require('socket.io-client')('http://192.168.196.163:3000');
var moment = require('moment');
var scp = require('scp');
var fileNameTImeStamp;
var name;

mainServer.on('connect', function(){
    console.log("CONNECTED");
    });


  function transfertoMaster(){
    fileNameTImeStamp = moment().format("YYYY-MM-DD_HHmm");
    name = 'BC_' + fileNameTImeStamp + ".mp4"
    var options = {
        file: '/home/jack/bodycam/*.mp4',
        user: 'jack',
        host: '192.168.196.163',
        port: '22',
        path: '/home/jack/videos'
    }
    scp.send(options, function (err) {
        if (err) console.log(err);
        else console.log('File transferred.');
        
      });

  }
var spawn=require('child_process').spawn
, child=null;
    mainServer.on('bodyCam', function(data){
        console.log("40:  " + data)
    if(data==="START"){
        fileNameTImeStamp = moment().format("YYYY-MM-DD_HHmm");
        name = 'BC_' + fileNameTImeStamp + ".mp4"
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
        transfertoMaster();
           
          
    }
    });




