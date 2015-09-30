var React = require('react')
var extend = require('lodash/object/extend')
var ProfileStore = require('./store')
var Label = require('../../components/Label/')
var Input = require('../../components/Input/')
var Button = require('../../components/Button/')
var CreditcardsFormular = require('../../components/CreditcardsFormular/')
var Creditcards = require('../../components/Creditcards/')
var PreviousPayments = require('../PreviousPayments/')
var VoucherClaim = require('../VoucherClaim/')
var ProfileActions = require('./actions')
var moment = require('moment')
var classes = require('classnames')

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
      .catch(function(err) {
        self.setState({
          loading: false,
          message: 'Failed'
        })
      })
  },
  render: function() {
    var self = this
    var nameClasses = classes('Input', {
      'Profile__Name--Valid': this.state.name,
      'Profile__Name--Invalid': !this.state.name
    })
    var emailClasses = classes('Input', {
      'Profile__Email--Valid': this.state.email,
      'Profile__Email--Invalid': !this.state.email
    })
    return (
      <div>
        <div className='Profile__block'>
          <form onSubmit={this.onSubmit}>
            <h1>Profile</h1>
            <Label>Name</Label>
            <Input type='text' value={this.state.name} className={nameClasses} onChange={this.handleNameChange}/>
            <Label>E-mail</Label>
            <Input type='text' value={this.state.email} className={emailClasses} onChange={this.handleEmailChange}/>
            <Label>Docker Registry Username</Label>
            <Input type='text' value={this.state.username} disabled='disabled'/>
            <div>
              <Button type='submit'>Update</Button>
            </div>
            {this.state.loading && <div>Loading...</div>}
            {this.state.message}
          </form>
        </div>
        <div className='Profile__block'>
          <h2>Information</h2>
            <div>Current Balance</div>
            <div>${this.state.credit / 100}</div>
            <div>Registration Date</div>
            <div>{moment.unix(this.state.timestamp).format()}</div>
        </div>
        <div className='Profile__block'>
          <VoucherClaim/>
        </div>
        <div className='Profile__block'>
          <Creditcards/>
        </div>
        <div className='Profile__block'>
          <CreditcardsFormular/>
        </div>
        <div className='Profile__block'>
          <PreviousPayments/>
        </div>
      </div>
    );
  }
})

module.exports = Profile
