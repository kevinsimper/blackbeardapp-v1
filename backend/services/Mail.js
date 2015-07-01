var MailgunJs = require('mailgun-js')
var config = require('../config')

module.exports = {
  send: function(data, responseFunction) {
    if (process.env.NODE_ENV === 'production') {
      var mailgun = MailgunJs({
        apiKey: config.MAILGUN.key,
        domain: config.MAILGUN.domain
      });

      return mailgun.messages().send(data, responseFunction)
    } else {
      return responseFunction(null, {});
    }
  }
}