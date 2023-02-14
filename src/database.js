import { Connection, Request, TYPES } from 'tedious';

const config = {
  user: 'sa',
  password: 'log-onCp9',
  server: '192.168.1.39',
  database: 'mac',
  options: {
    encrypt: true,
    TrustServerCertificate: true
  }
}

const connection = new Connection(config);

connection.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected');
  }
});

export default connection;
