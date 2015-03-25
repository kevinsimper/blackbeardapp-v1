var React = require('react');
var classNames = require('classNames');

var SignupPopup = React.createClass({
  render: function() {
    return (
      <div className="popup popup--visible">
        <h1>We are not quite ready yet</h1>
        <p>{'But you can sign up and you will get a special invitation when we are ready'}</p>
        <input type="email" placeholder="Email" className="input input__email" />
        <button className="popup__btn-signup">Signup now</button>
      </div>
    );
  }
});

module.exports = SignupPopup;