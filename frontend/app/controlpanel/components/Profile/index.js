var React = require('react')
var extend = require('lodash/object/extend')
var ProfileStore = require('./store')
var Input = require('../../components/Input/')
var Button = require('../../components/Button/')
var CreditcardsFormular = require('../../components/CreditcardsFormular/')
var Creditcards = require('../../components/Creditcards/')
var PreviousPayments = require('../PreviousPayments/')
var ProfileActions = require('./actions')
var moment = require('moment')

var Profile = React.createClass({
  getState: function() {
    return ProfileStore.getProfile()
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loading: false,
      message: ''
    })
  },
  componentDidMount: function() {
    ProfileActions.load()
    this.unsubscribe = ProfileStore.listen(this.onChange)
  },
  onChange: function() {
    this.setState(this.getState())
  },
  handleNameChange: function(e) {
    this.setState({
      name: e.target.value
    })
  },
  handleEmailChange: function(e) {
    this.setState({
      email: e.target.value
    })
  },
  onSubmit: function(e) {
    e.preventDefault()
    var self = this
    this.setState({
      loading: true
    })
    ProfileActions.update(this.state)
      .then(function() {
        self.setState({
          loading: false,
          message: 'Updated'
        })
      })
  },
  render: function() {
    return (
      <div>
        <form onSubmit={this.onSubmit}>
          <h1>Profile</h1>
          <h2>Personal</h2>
          <div>Name</div>
          <Input type='text' value={this.state.name} onChange={this.handleNameChange}/>
          <div>E-mail</div>
          <Input type='text' value={this.state.email} onChange={this.handleEmailChange}/>
          <div>
            <Button type='submit'>Update</Button>
          </div>
          {this.state.loading && <div>Loading...</div>}
          {this.state.message}
        </form>
        <h2>Information</h2>
          <div>Current Balance</div>
          ${this.state.credit/100}
          <div>Registration Date</div>
          {moment.unix(this.state.timestamp).format()}
        <Creditcards/>
        <CreditcardsFormular/>
        <PreviousPayments/>
      </div>
    );
  }
})

module.exports = Profile
