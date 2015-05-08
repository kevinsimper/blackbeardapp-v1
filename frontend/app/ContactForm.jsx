var React = require('react');
var request = require('superagent');

var BACKEND_HOST = process.env.BACKEND_HOST;

var ContactForm = React.createClass({
  getInitialState: function() {
    return {
      name: '',
      email: '',
      message: '',
      status: ''
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
  handleSubmit: function(e) {
    e.preventDefault();

    var self = this

    request
      .post(BACKEND_HOST + '/contact')
      .send({
        name: this.state.name,
        email: this.state.email,
        message: this.state.message,
      })
      .end(function(err, res) {
        if(err) {
          self.setState({
            status: 'There was an error sending your message!'
          })
        } else {
          self.setState({
            status: 'Your message was send!'
          })
        }
      })
  },
  render: function() {
    return (
      <div>
        <h2 className="typo__headline">Got any questions?</h2>

        <form className="contact-form" onSubmit={this.handleSubmit}>
            <label>Name</label>
            <input className="name" type="text" value={this.state.name} onChange={this.handleNameChange} required />
            <label>Email</label>
            <input className="email" type="email" value={this.state.email} onChange={this.handleEmailChange} required />
            <label>Message</label>
            <textarea className="message" value={this.state.message} onChange={this.handleMessageChange} required></textarea>
            <button className="btn-send" type="submit">Send message</button>
            <div>{this.state.status}</div>
        </form>
      </div>
    );
  }

});

module.exports = ContactForm;