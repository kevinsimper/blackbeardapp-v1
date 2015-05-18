var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var request = require('request');

lab.test('POST /contact', function (done) {
  request({
    har: {
      url: 'http://localhost:8000/contact',
      method: 'POST',
      headers: [
        {
          name: 'content-type',
          value: 'application/json'
        }
      ],
      postData: {
        mimeType: 'application/json',
        params: [
          {
            email: 'j@j.com',
            name: 'James',
            message: 'This is a test message.'
          }
        ]
      }
    }
  },
    function (error, response, body) {
      Code.expect(body).to.equal('{"status":"OK"}');
      done();
    }
  );
});