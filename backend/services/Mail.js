var MailgunJs = require('mailgun-js')
var config = require('../config')

module.exports = {
  send: function(data, responseFunction) {
    var mailgun = MailgunJs({apiKey: config.MAILGUN.key, domain: config.MAILGUN.domain});

	mailgun.messages().send(data, responseFunction)
  }
}