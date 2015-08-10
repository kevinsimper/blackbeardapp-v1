var React = require('react');
var Signup = require('./components/Signup/');
var ContactForm = require('./components/ContactForm/');

NodeList.prototype.forEach = Array.prototype.forEach;

window.addEventListener('load', function() {
  document.querySelectorAll('.priceitem__deploy').forEach(function(item) {
    item.addEventListener('click', function() {
      var event = new Event('showSignup');
      window.dispatchEvent(event);
      window.scrollTo(0,1)
    }, false);
  });
})

React.render(<Signup/>, document.querySelector('.signup'));
React.render(<ContactForm/>, document.querySelector('.contact .container'));
