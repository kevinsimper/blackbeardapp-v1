var React = require('react');
var SignupPopup = require('./SignupPopup.jsx')

var Signup = React.createClass({
  render: function() {
    return (
      <div>
        <button className="btn-signup">Signup now</button>
        <SignupPopup />
      </div>
    );
  }
});

module.exports = Signup;