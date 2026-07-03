const { Client } = require('ssh2');

const config = {
  host: '72.62.2.160',
  port: 22,
  username: 'root',
  password: 'W@p0UxZcg7.b7D@'
};

const conn = new Client();
conn.on('ready', () => {
  console.log('READY!');
  conn.end();
}).on('handshake', (negotiised) => {
  console.log('Handshake completed:', negotiised);
}).on('error', (err) => {
  console.log('Error details:', err);
}).on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
  console.log('Keyboard-interactive prompts:', prompts);
  finish([config.password]);
}).connect({
  ...config,
  tryKeyboard: true,
  debug: console.log
});
