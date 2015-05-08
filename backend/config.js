if (!process.env.DB_PORT_27017_TCP_ADDR) {
  process.env.DB_PORT_27017_TCP_ADDR = 'localhost';
  process.env.DB_PORT_27017_TCP_PORT = 27017;
}

// exports.DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';
exports.DATABASE_URL = 'mongodb://db.blackbeard.io:27017/blackbeard';