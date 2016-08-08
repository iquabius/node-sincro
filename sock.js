// http://stackoverflow.com/questions/6177423/send-broadcast-datagram
var ip = require('ip');

var nome = "Node 1";
var PORT = 6024;
var HOST = '127.0.0.1';
var BROADCAST_ADDR = "192.168.2.255";
var dgram = require('dgram');
var sock = dgram.createSocket("udp4");

var init = function() {
  sock.setBroadcast(true);
  var address = sock.address;
  console.log(`Cliente UDP escutando em ${address.address}: ${address.port}`);
  broadcastNew();
};

function broadcastNew() {
  var message = new Buffer(`${nome}: Broadcast message!`);
  sock.send(message, 0, message.length, PORT, BROADCAST_ADDR, function() {
      console.log(`Enviado "${message}".`);
  });
}

sock.on('message', function (message, rinfo) {
  console.log(`Mensagem recebida: ${rinfo.address}: ${rinfo.port} - ${message}`);
  if (ip.address() != rinfo.address) {
    var response = new Buffer(`${nome}: Bem vindo!`);
    sock.send(response, 0, response.length, rinfo.port, rinfo.address, function() {
      console.log(`Novo nó ${rinfo.address}`);
    });
  }
});

sock.bind(PORT, init);
