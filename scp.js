var scp = require('scp');
 
var options = {
  file: '/home/jack/bodycam/2020-09-03_17:13:30.mp4',
  user: 'jack',
  host: '192.168.196.163',
  port: '22',
  path: '/home/jack/videos'
}
 
scp.send(options, function (err) {
  if (err) console.log(err);
  else console.log('File transferred.');
});

