var Mailgun = require('mailgun-js')
var fs = require('fs')
var mkdirp = require('mkdirp')

/**
* @param {object} data
* @param {string} data.from
* @param {string} data.to
* @param {string} data.subject
* @param {string} data.text
* @param {function} callback
*/
exports.send = function (data, callback) {
  if (process.env.NODE_ENV === 'production') {
    var mailgun = Mailgun({
      apiKey: process.env.MAILGUN_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });
    return mailgun.messages().send(data, callback)
  } else {
    var filename = Date.now() + data.subject + '.json'
    mkdirp('./fixtures/mails/', function () {
      fs.writeFile('./fixtures/mails/' + filename, JSON.stringify(data, null, 2), function (err) {
//        console.log(err)
        callback(err, {})
      })
    })
  }
}
