// Pacote com utilitários de endereço de IP
const ip = require('ip');

// A função "execFile" (do módulo "child_process") permite a execução de
// programas sem a necessidade de rodar um interpretador de comandos (Shell).
const execFile = require('child_process').execFile;

// O módulo "dgram" oferece uma API de sockets UDP, tanto para redes IPv4
// quanto redes IPv6.
const dgram = require('dgram');
// "dgram.createSocket('udp6');" criaria um socket UDP para uma rede IPv6.
const sock = dgram.createSocket('udp4');

// Configuração da aplicação
let config = {
  bcastInterval: 5000,      // Intervalo em ms entre as mensagens de broadcast
  clockMarginOfError: 10*1000,  // Margem de erro em milisegundos
  socketPort: 6024,             // Porta onde o socket escuta
  bcastAddr: "255.255.255.255"
};

let appInit = function() {
  sock.setBroadcast(true);
  let sockAddr = sock.address();
  console.log(`Socket UDP escutando em ${sockAddr.address}:${sockAddr.port}\n`);
  sendDatetimeBroadcast();
  setInterval(sendDatetimeBroadcast, config.bcastInterval);
};

// IP não específicado, então o SO vai tentar ouvir em todos os
// endereços
sock.bind(config.socketPort, appInit);

/**
 * Envia uma mensagem broadcast com o datagrama contendo a data e hora
 * no formato "2016-12-31 23:59:59".
 */
function sendDatetimeBroadcast() {
  // Pega a data e a hora do sistema de forma assíncrona. Passa uma
  // função como argumento para ser chamada quando a data e hora forem
  // retornadas.
  getDatetime((datetimeStr) => {
    // Cria um buffer com a string contendo a data e a hora local
    let msg = Buffer.from(datetimeStr);
    // Envia o buffer para o endereço de broadcast
    sock.send(msg, 0, msg.length, config.socketPort, config.bcastAddr, () => {
      console.log(`=> Mensagem de broadcast enviada: "${datetimeStr}".`);
    });
  });
}

sock.on('message', (msg, rinfo) => {
  // Ignora mensagens de broadcast enviadas pelo próprio host.
  if (ip.address() != rinfo.address) {
    getDatetime((datetimeStr) => {
      // Cria objetos para data/hora local e remota, permitindo que as
      // duas sejam comparadas
      let datetime = new Date(datetimeStr);
      let remoteDatetime = new Date(msg);

      // Se a data/hora local for maior e a diferença for maior que
      // config.clockMarginOfError milisegundos
      if (datetime > remoteDatetime
          && (datetime - remoteDatetime) > config.clockMarginOfError) {
        console.log(`Hora local é maior.`);
        // Cria um buffer com a data e a hora local
        let response = Buffer.from(datetimeStr);
        // Envia o buffer para o endereço do remetente
        sock.send(response, 0, response.length, rinfo.port, rinfo.address, () => {
          console.log(`Hora local enviada para ${rinfo.address}.`);
        });
      } else if (datetime < remoteDatetime
                 && (remoteDatetime - datetime) > config.clockMarginOfError) {
        // Caso a data/hora enviada seja maior, atualiza a data/hora local
        console.log(`Hora local é menor.`);
        setDatetime(msg, (output) => {
          console.log(`Hora local atualizada de ${rinfo.address}: ${output}`);
        });
      } else {
        console.log(`Horas iguais:\n  Local: ${datetimeStr}\n  Remota (${rinfo.address}): ${msg}`);
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
    // Pega todos os carácteres da saída padrão (stdout) exceto o
    // último, que é um carácter de nova linha: '\n'.
    let datetimeStr = stdout.slice(0, -1);
    callback(datetimeStr);
  });
}

/**
 * Seta a hora do sistema com o comando 'date' do linux.
 *
 * @param {string} datetime Data e hora no formato "2016-12-31 23:59:59".
 * @param {function} callback Função para ser chamada com a saída
 * produzida pelo comando 'date -s <data-e-hora>'.
 * @throws {Error} Caso execFile() retorne um erro ao tentar executar o comando.
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
