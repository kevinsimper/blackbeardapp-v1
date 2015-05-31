if(process.env.NODE_ENV == 'production') {
  exports.DATABASE_URL = 'mongodb://blackbeard:dgf4e6lyGs6Ck7jwEkcXKC73JJY@ds037611.mongolab.com:37611/blackbeard'
} else if(process.env.NODE_ENV === 'development' && (typeof process.env.DATABASE_URL !== 'undefined')) {
  exports.DATABASE_URL = process.env.DATABASE_URL
} else {
  exports.DATABASE_URL = 'mongodb://' + process.env.DB_PORT_27017_TCP_ADDR + ':' +process.env.DB_PORT_27017_TCP_PORT + '/blackbeard'
}

exports.AUTH_SECRET = 'wuzUyxdXbqTjMgAK8BjdpGy3zaqGrSv2pwj2pbwq'

exports.MAILGUN = {
  key: 'key-5859ef062599d1fd5412c49e413f2e26',
  domain: 'sandbox7790b5e2eec7461d9501b24fa25d8d54.mailgun.org'
}
