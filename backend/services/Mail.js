var MailgunJs = require('mailgun-js')

module.exports = {
  send: function(data, responseFunction) {
    if (process.env.NODE_ENV === 'production') {
      var mailgun = MailgunJs({
        apiKey: process.env.MAILGUN_KEY,
        domain: process.env.MAILGUN_DOMAIN
      });

      return mailgun.messages().send(data, responseFunction)
    } else {
      return responseFunction(null, {});
    }
  }
}
