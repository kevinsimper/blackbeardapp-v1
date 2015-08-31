if(process.env.NODE_ENV == 'production') {
  exports.DATABASE_URL = 'mongodb://blackbeard:dgf4e6lyGs6Ck7jwEkcXKC73JJY@ds037611.mongolab.com:37611/blackbeard'
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.DATABASE_URL !== 'undefined')) {
  exports.DATABASE_URL = process.env.DATABASE_URL
} else {
  exports.DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard'
}

if(process.env.NODE_ENV == 'production') {
  exports.RABBITMQ_URL = 'mongodb://blackbeard:dgf4e6lyGs6Ck7jwEkcXKC73JJY@ds037611.mongolab.com:37611/blackbeard'
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.RABBITMQ_URL !== 'undefined')) {
  exports.RABBITMQ_URL = process.env.RABBITMQ_URL
} else {
  exports.RABBITMQ_URL = 'amqp://' + process.env.RABBITMQ_PORT.replace('tcp://', '')
}
