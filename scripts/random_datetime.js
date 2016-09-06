const execFile = require('child_process').execFile;

function random_datetime() {
  let year = Math.floor((Math.random() * 5) + 2016);
  year = (year < 10 ? '0' : '') + year;

  let month = Math.floor((Math.random() * 12) + 1);
  month = (month < 10 ? '0' : '') + month;

  let day = Math.floor((Math.random() * 28) + 1);
  day = (day < 10 ? '0' : '') + day;

  let hour = Math.floor((Math.random() * 24) + 0);
  hour = (hour < 10 ? '0' : '') + hour;

  let minutes = Math.floor((Math.random() * 60) + 0);
  minutes = (minutes < 10 ? '0' : '') + minutes;

  let seconds = Math.floor((Math.random() * 60) + 0);
  seconds = (seconds < 10 ? '0' : '') + seconds;

  return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}

let datetime = random_datetime();

const child = execFile('date', ['-s', datetime], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  if (stderr) {
    console.error(stderr);
  }
  console.log(`Hora aleatória setada: "${datetime}"`);
});
