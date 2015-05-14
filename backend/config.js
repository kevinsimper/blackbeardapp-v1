if(process.env.NODE_ENV == 'production') {
  exports.DATABASE_URL = 'mongodb://blackbeard:dgf4e6lyGs6Ck7jwEkcXKC73JJY@ds037611.mongolab.com:37611/blackbeard'; 
} else {
  exports.DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard';
}