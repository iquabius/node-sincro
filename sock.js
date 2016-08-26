// http://stackoverflow.com/questions/6177423/send-broadcast-datagram
let ip = require('ip');
let moment = require('moment');
const execFile = require('child_process').execFile;

const PORT = 6024;
const BROADCAST_ADDR = "255.255.255.255";
const dgram = require('dgram');
const sock = dgram.createSocket("udp4");

let config = {
  broadcastInterval: 5000
}

let init = function() {
  sock.setBroadcast(true);
  let address = sock.address();
  console.log(`Socket UDP escutando em ${address.address}: ${address.port}\n`);
  sendDatetimeBroadcast();
  setInterval(sendDatetimeBroadcast, config.broadcastInterval);
};

sock.bind(PORT, init);

/**
 * Envia uma mensagem broadcast com o datagrama contendo a data e hora
 * no formato "2016-12-31 23:59:59".
 * @returns {void}
 */
function sendDatetimeBroadcast() {
  // Pega a data e a hora do sistema de forma assíncrona. Passa uma
  // função como argumento para ser chamada quando a data e hora forem
  // retornadas.
  getDatetime((datetimeStr) => {
    // Cria um buffer com a a string de data e hora
    let message = new Buffer(datetimeStr);
    // Envia o buffer para endereço de broadcast
    sock.send(message, 0, message.length, PORT, BROADCAST_ADDR, () => {
      console.log(`=> Mensagem de broadcast enviada: "${datetimeStr}"`);
    });
  });
}

sock.on('message', (message, rinfo) => {
  // Ignora mensagens de broadcast enviadas pelo próprio host.
  if (ip.address() != rinfo.address) {
    getDatetime((datetimeStr) => {
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
        setDatetime(message, (output) => {
          console.log(`Hora atualizada: ${output}`);
        });
      } else {
        console.log(`Horas iguais: ${datetimeStr} e ${message}`);
      }
    });
  }
});

/**
 * Pega a hora do sistema com o comando 'date' do linux.
 *
 * @param {function} callback A função que será chamada quando o comando
 * 'date +%F %T' retornar a data e a hora do sistema, que serão passadas como
 * um argumento do tipo string no formato "2016-12-31 23:59:59".
 * @throws {Error} Caso execFile() retorne um erro ao tentar executar o comando.
 * @returns {void}
 */
function getDatetime(callback) {
  // Executa o comando 'date +%F %T' de forma assíncrona. O último
  // argumento é uma função que será chamada quando o comando retornar
  // uma saída.
  const child = execFile('date', ['+%F %T'], (error, stdout, stderr) => {
    // "On success, error will be null. On error, error will be an
    // instance of Error."
    if (error) {
      throw error;
    }
    if (stderr) {
      // Caso o comando retorne uma mensagem de erro no canal de erro
      // padrão (stdout).
      console.error(`O comando 'date +%F %T' retornou um erro:\n${stderr}`);
      // Para a execução com um código de falha
      process.exit(1);
    }
    // Pega todos os caractéres da saída padrão (stdout) exceto o
    // último, que é um caractér de nova linha: '\n'.
    let datetimeStr = stdout.slice(0, -1);
    callback(datetimeStr);
  });
}

// time string
/**
 * Seta a hora do sistema com o comando 'date' do linux.
 *
 * @param {string} datetime Data e hora no formato "2016-12-31 23:59:59".
 * @param {function} callback Função para ser chamada com a saída
 * produzida pelo comando 'date -s <data-e-hora>'.
 * @throws {Error} Caso execFile() retorne um erro ao tentar executar o comando.
 * @returns {void}
 */
function setDatetime(datetime, callback) {
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
