// http://stackoverflow.com/questions/6177423/send-broadcast-datagram
let ip = require('ip');
let moment = require('moment');
const execFile = require('child_process').execFile;

const PORT = 6024;
const BROADCAST_ADDR = "255.255.255.255";
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
  getTime((datetimeStr) => {
    // cria um buffer com a hora e envia o broadcast
    let message = new Buffer(datetimeStr);
    sock.send(message, 0, message.length, PORT, BROADCAST_ADDR, () => {
      console.log(`Broadcast enviado: ${datetimeStr}`);
    });
  });
}

sock.on('message', function (message, rinfo) {
  // console.log(`Mensagem recebida: ${rinfo.address}: ${rinfo.port} - ${message}`);
  if (ip.address() != rinfo.address) {
    getTime((datetimeStr) => {
      //let timei = parseInt(time);
      //let messagei = parseInt(message);
      let remoteDatetime = new Date(message);
      //Remover a dependência no 'moment.js' (Já que não vai mais precisar do 'format')?
      let datetime = moment(datetimeStr);
      // se a hora local for maior e a diferença maior que 30s
      // cria um buffer com a hora local e envia
      if (datetime > remoteDatetime && (datetime - remoteDatetime) > 30*1000) {
        console.log(`Hora local é maior.`);
        let response = Buffer.from(datetimeStr);
        sock.send(response, 0, response.length, rinfo.port, rinfo.address, () => {
          console.log(`Hora local enviada para ${rinfo.address}`);
        });
      } else if (datetime < remoteDatetime && (remoteDatetime - datetime) > 30*1000) {
        // caso a enviada seja maior, atualize a hora local
        console.log(`Hora local é menor.`);
        setTime(message, (output) => {
          console.log(`Hora atualizada: ${output}`);
        });
      } else {
        console.log(`Horas iguais: ${datetimeStr} e ${message}`);
      }
    });
  }
});

sock.bind(PORT, init);

/**
 * Chama a função 'callback' com a hora (segundos passados desde 01-01-1970)
 */
function getTime(callback) {
  const child = execFile('date', ['+%F %T'], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    if (stderr) {
      console.error(stderr);
    }
    // 'slice' remove o carácter "\n" do fim da string.
    let datetimeStr = stdout.slice(0, -1);
    console.log(`Hora do sistema: ${datetimeStr}`);
    callback(datetimeStr);
  });
}

// time string
function setTime(datetime, callback) {
  const child = execFile('date', ['-s', datetime], (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    if (stderr) {
      console.error(stderr);
    }
    callback(stdout);
  });
}
