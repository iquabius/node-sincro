var PORT = 6024;
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

client.on('listening', function () {
    var address = client.address();
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    client.setBroadcast(true);
});

client.on('message', function (message, rinfo) {
  console.log('Message from: ' + rinfo.address + ':' + rinfo.port +' - ' + message);
  var message = new Buffer("Cliente diz olá!");
  client.send(message, 0, message.length, rinfo.port, rinfo.address, function() {
    console.log("Sent '" + message + "'");
  });
});

client.bind(PORT);
