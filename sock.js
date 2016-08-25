// http://stackoverflow.com/questions/6177423/send-broadcast-datagram
let ip = require('ip');
const execFile = require('child_process').execFile;

const PORT = 6024;
const BROADCAST_ADDR = "192.168.0.255";
const dgram = require('dgram');
const sock = dgram.createSocket("udp4");

let init = function() {
  sock.setBroadcast(true);
  let address = sock.address();
  console.log(`Cliente UDP escutando em ${address.address}: ${address.port}`);
  broadcastNew();
};

function broadcastNew() {
  // pega a hora do sistema de forma assíncrona
  getTime((time) => {
    // cria um buffer com a hora e envia o broadcast
    let message = new Buffer(time);
    sock.send(message, 0, message.length, PORT, BROADCAST_ADDR, () => {
      console.log(`Broadcast enviado: ${time}`);
    });
  });
}

sock.on('message', function (message, rinfo) {
  // console.log(`Mensagem recebida: ${rinfo.address}: ${rinfo.port} - ${message}`);
  if (ip.address() != rinfo.address) {
    getTime((time) => {
      let timei = parseInt(time);
      let messagei = parseInt(message);
      // se a hora local for maior e a diferença maior que 30s
      // cria um buffer com a hora local e envia
      if (timei > messagei && (timei - messagei) > 30) {
        console.log(`Hora local é maior.`);
        let response = Buffer.from(time);
        sock.send(response, 0, response.length, rinfo.port, rinfo.address, () => {
          console.log(`Hora local enviada para ${rinfo.address}`);
        });
      } else if (timei < messagei && (messagei - timei) > 30) {
        // caso a enviada seja maior, atualize a hora local
        console.log(`Hora local é menor.`);
        setTime(message, (output) => {
          console.log(`Hora atualizada: ${output}`);
        });
      } else {
        console.log(`Horas iguais: ${time} e ${message}`);
      }
    });
  }
});

sock.bind(PORT, init);

/**
 * Chama a função 'callback' com a hora (segundos passados desde 01-01-1970)
 */
function getTime(callback) {
  const child = execFile('date', ['+%s'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    if (stderr) {
      console.error(stderr);
    }
    console.log(`Hora do sistema: ${stdout}`);
    callback(stdout);
  });
}

// time string
function setTime(time, callback) {
  const child = execFile('date', ['+%s', '-s', time], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    if (stderr) {
      console.error(stderr);
    }
    callback(stdout);
  });
}
