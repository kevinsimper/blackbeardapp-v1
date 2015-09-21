var React = require('react');
var Signup = require('./components/Signup/');
var ContactForm = require('./components/ContactForm/');

window.addEventListener('load', function () {
  var priceItems = document.querySelectorAll('.priceitem__deploy')
  Array.prototype.forEach.call(priceItems, function (element) {
    element.addEventListener('click', function () {
      window.location.href = '/signup'
    })
  })
})

React.render(<Signup/>, document.querySelector('.signup'));
React.render(<ContactForm/>, document.querySelector('.contact .container'));
