var React = require('react');
var Signup = require('./signup.jsx');
var ContactForm = require('./ContactForm.jsx');



React.render(<Signup />, document.querySelector('.signup'));

React.render(<ContactForm/>, document.querySelector('.contact .container'));