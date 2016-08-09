// http://stackoverflow.com/questions/6177423/send-broadcast-datagram
let ip = require('ip');

let nome = "Node 1";
const PORT = 6024;
const HOST = '127.0.0.1';
const BROADCAST_ADDR = "192.168.2.255";
const dgram = require('dgram');
const sock = dgram.createSocket("udp4");

let init = function() {
  sock.setBroadcast(true);
  let address = sock.address;
  console.log(`Cliente UDP escutando em ${address.address}: ${address.port}`);
  broadcastNew();
};

function broadcastNew() {
  let message = new Buffer(`${nome}: Broadcast message!`);
  sock.send(message, 0, message.length, PORT, BROADCAST_ADDR, function() {
      console.log(`Enviado "${message}".`);
  });
}

sock.on('message', function (message, rinfo) {
  console.log(`Mensagem recebida: ${rinfo.address}: ${rinfo.port} - ${message}`);
  if (ip.address() != rinfo.address) {
    let response = new Buffer(`${nome}: Bem vindo!`);
    sock.send(response, 0, response.length, rinfo.port, rinfo.address, function() {
      console.log(`Novo nó ${rinfo.address}`);
    });
  }
});

sock.bind(PORT, init);
