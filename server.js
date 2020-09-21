var mainServer = require('socket.io-client')('http://192.168.196.163:3000');
var moment = require('moment');
var scp = require('scp');
var geolib = require('geolib');
var GPS = require('./node_modules/gps/gps.js');
var angles = require('angles');
var fileNameTImeStamp;
var name;
var prevLAT;
var prevLON;
var GPSarray = []
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
            "-vf", "transpose=2",
            "-c:v", "h264", "-r", "30", 
            "-s", "1280x720", "-itsoffset", "0.5",
             "-i", "/dev/video0",
             "-copyinkf", "-codec:v", "copy", "-codec:a", "aac", 
             "-ab", "128k", "-g", "10", 
             "-f", "flv", "rtmp://192.168.196.123/live/BodyCam",
             name
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

    var gps = new GPS;
    const SerialPort = require('serialport')
    const port = new SerialPort('/dev/ttyS0', {
        baudRate: 9600
    })
    const Readline = require('@serialport/parser-readline')
    
    // Open errors will be emitted as an error event
    port.on('error', function(err) {
      console.log('Error: ', err.message)
    })
    
    
    
    var tripA;
    var tripB;
    
    function parseGPS(data) {
        var lat = data.state.lat;
        var lon = data.state.lon;
        //console.log(lat)
        if (lat != null) {
            tripA.push({latitude: lat,longitude: lon});
            tripB.push({latitude: lat,longitude: lon})
        }
        if (tripA.length === 4) {
            var distance = geolib.getPathLength(tripA, [10, 5]);
            distance = geolib.convertUnit('mi', distance, 4)
            distanceTripA = distanceTripA + distance;
            io.emit('distanceA', distanceTripA);
            tripA.length = 0;
        }
        if (tripB.length === 4) {
            var distance = geolib.getPathLength(tripB, [10, 5]);
            distance = geolib.convertUnit('mi', distance, 4)
            distanceTripB = distanceTripB + distance;
            io.emit('distanceB', distanceTripB);
            tripB.length = 0;
        }
    }
    const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
    parser.on('data', function(data) {
        
        gps.update(data);
        //parseGPS(gps);
    })
    function calculateHeading(lon, lat) {
        var Heading = 0;
        
        Heading = GPS.Heading(prevLAT, prevLAT, lat, lon);
        Heading = Heading.toFixed(0)
        prevLAT = lat;
        prevLON = lon;
        return Heading;
    }
    gps.on('GGA', function(data) {
        
        var headingDir = calculateHeading(data.lon, data.lat)
        GPSarray['lon'] = data.lon
        GPSarray['lat'] = data.lat
        GPSarray['heading'] = headingDir
        if (gps.state.speed != null) {GPSarray['speed'] = gps.state.speed.toFixed(2)}
        if (gps.state.speed == null) {GPSarray['speed'] = 0}
            GPSarray['time'] = data.time
            if (data.lon === null) {
            var pos = {'lon': '-76.558225','lat': '38.06033333333333'}
        } else {
            var pos = {'lon': data.lon,'lat': data.lat}
        }
        //console.log(data)
        mainServer.emit('bodyCamgps', data)

        //dreamHost.emit('gpsData', GPSarray)
        //io.emit('state', GPSarray);
    });


