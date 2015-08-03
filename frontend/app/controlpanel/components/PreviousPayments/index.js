var React = require('react/addons')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Button = require('../Button')
var Label = require('../Label')
var PreviousPaymentsActions = require('./actions')
var PreviousPaymentsStore = require('./store')

var PreviousPayments = React.createClass({
  getInitialState: function() {
    return extend(PreviousPaymentsStore.getPayments(), {
      loading: false,
      message: ''
    })
  },
  componentDidMount: function() {
    PreviousPaymentsActions.load()
    this.unsubscribe = PreviousPaymentsStore.listen(this.onChange)
  },
  render: function() {
    return (
      <form className='PreviousPayments' onSubmit={this.onSubmit}>
        <h2>Previous Payments</h2>


        <div>
          <Button>Create creditcard</Button>
        </div>
        {this.state.loading && <div>Loading ...</div>}
      </form>
    )
  }
})

module.exports = PreviousPayments
