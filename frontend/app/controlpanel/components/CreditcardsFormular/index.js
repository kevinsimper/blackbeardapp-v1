var React = require('react/addons')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Button = require('../Button')
var Label = require('../Label')
var Select = require('../Select')
var CreditcardsActions = require('../Creditcards/actions')
var classNames = require('classnames')
var countries = require('country-data').countries

var CreditcardsFormular = React.createClass({
  mixins: [React.addons.LinkedStateMixin],
  getInitialState: function() {
    return {
      loading: false,
      error: false,
      name: '',
      country: '',
      creditcard: '',
      cvv: '',
      expiryMonth: '',
      expiryYear: '',
      expires: ''
    }
  },
  onSubmit: function(e) {
    e.preventDefault()
    var self = this
    this.setState({
      loading: true
    })
    var data = extend(this.state, {
      expiryMonth: '',
      expiryYear: ''
    })
    if (this.state.expires) {
      data = extend(this.state, {
        expiryMonth: this.state.expires.split('/')[0],
        expiryYear: this.state.expires.split('/')[1]
      })
    }
    CreditcardsActions.new(data)
    .then(function() {
      self.setState({
        loading: false,
        error: false,
        name: '',
        country: '',
        creditcard: '',
        cvv: '',
        expiryMonth: '',
        expiryYear: '',
        expires: ''
      })
    }).catch(function(err) {
      self.setState({
        loading: false,
        error: true
      })
    })
  },
  handleExpiryChange: function(e) {
    var newValue = e.target.value
    var oldValue = this.state.expires
    if(newValue.length === 2 && oldValue.length === 3) {
      newValue = newValue.slice(0, -1)
    } else if(newValue.length === 2) {
      newValue = newValue + '/'
    } else if(newValue.length === 6) {
      newValue = newValue.slice(0, -1)
    }
    this.setState({
      expires: newValue
    })
  },
  render: function() {
    var self = this


    var error = {
      border: "1px solid #f00",
      backgroundColor: "lighten(#f00, 40%)",
      padding: "10px",
      margin: "10px 0"
    }
    return (
      <form className='Payment' onSubmit={this.onSubmit}>
        <h2>New Credit Card</h2>
        <Label>Name</Label>
        <Input placeholder='Master Department Mastercard' valueLink={this.linkState('name')}/>
        <Label>Country</Label>
        <div>
          <Select valueLink={this.linkState('country')}>
            <option value="">-</option>
            {countries.all.map(function(country) {
              return <option value={country.alpha2}>{country.name}</option>
            })}
          </Select>
        </div>
        <Label>Card Number</Label>
        <Input placeholder='1234-5678-9012-3456' valueLink={this.linkState('creditcard')}/>
        <Label>CCV</Label>
        <Input valueLink={this.linkState('cvv')}/>
        <Label>Expires</Label>
        <Input placeholder='MM/YY' value={this.state.expires} onChange={this.handleExpiryChange}/>
        <div>
          <Button>Create creditcard</Button>
        </div>
        {this.state.loading && <div>Loading ...</div>}
        {this.state.error && <div style={error}>Invalid Credit Card details.</div>}
      </form>
    )
  }
})

module.exports = CreditcardsFormular
