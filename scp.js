var scp = require('scp');
var options = {
  file: '/home/jack/bodycam/*.mp4',
  user: 'admin',
  host: '192.168.196.51',
  port: '22',
  path: '/home/admin/videos'
}
scp.send(options, function (err) {
  if (err) console.log(err);
  else console.log('File transferred.');
});