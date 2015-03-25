var React = require('react');

var ContactForm = React.createClass({
  getInitialState: function() {
    return {
      name: '',
      email: '',
      message: ''
    };
  },
  handleNameChange: function(e) {
    this.setState({
      name: e.target.value
    });
  },
  handleEmailChange: function(e) {
    this.setState({
      email: e.target.value
    });
  },
  handleMessageChange: function(e) {
    this.setState({
      message: e.target.value
    });
  },
  render: function() {
    return (
      <h2 className="typo__headline">Got any questions?</h2>

      <form className="contact-form">
          <label>Name</label>
          <input className="name" type="text" onChange={this.handleNameChange}>
          <label>Email</label>
          <input className="email" type="email" onChange={this.handleEmailChange}>
          <label>Message</label>
          <textarea className="message" onChange={this.handleMessageChange}></textarea>
          <button className="btn-send" >Send message</button>
      </form>
    );
  }

});

module.exports = ContactForm;