if(process.env.NODE_ENV == 'production') {
  exports.DATABASE_URL = process.env.DATABASE_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.DATABASE_URL !== 'undefined')) {
  exports.DATABASE_URL = process.env.DATABASE_URL
} else {
  exports.DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard'
}

if(process.env.NODE_ENV == 'production') {
  exports.RABBITMQ_URL = process.env.RABBITMQ_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.RABBITMQ_URL !== 'undefined')) {
  exports.RABBITMQ_URL = process.env.RABBITMQ_URL
} else {
  exports.RABBITMQ_URL = 'amqp://' + process.env.RABBITMQ_PORT.replace('tcp://', '')
}

if(process.env.NODE_ENV == 'production') {
  exports.REGISTRY_URL = process.env.REGISTRY_URL
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.REGISTRY_URL !== 'undefined')) {
  exports.REGISTRY_URL = process.env.REGISTRY_URL
} else {
  exports.REGISTRY_URL = 'registry.blackbeard.dev:9500'
}
