var React = require('react/addons')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Button = require('../Button')
var Label = require('../Label')
var PreviousPaymentsActions = require('./actions')
var PreviousPaymentsStore = require('./store')
var moment = require('moment')

var PreviousPayments = React.createClass({
  getState: function() {
    return {
      payments: PreviousPaymentsStore.getPayments()
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  onChange: function() {
    this.setState(this.getInitialState())
  },
  componentDidMount: function() {
    PreviousPaymentsActions.load()
    this.unsubscribe = PreviousPaymentsStore.listen(this.onChange)
  },
  render: function() {
    return (
      <form className='PreviousPayments' onSubmit={this.onSubmit}>
        <h2>Previous Payments</h2>
        {this.state.payments.map(function(object, i){
          return <div>
              <div>...</div>
              <div>Created: {moment(parseInt(object.timestamp) * 1000).format()}</div>
              <div>Amount: {object.amount}</div>
              <div>Status: {object.status}</div>
              <div>CreditCard: {object.creditCard}</div>
            </div>
            ;
        })}
        <div>
          <Button>Create creditcard</Button>
        </div>
        {this.state.loading && <div>Loading ...</div>}
      </form>
    )
  }
})

module.exports = PreviousPayments
