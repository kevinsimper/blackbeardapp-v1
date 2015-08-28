var React = require('react/addons')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Button = require('../Button')
var Table = require('../Table')
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
    this.setState(this.getState())
  },
  componentDidMount: function() {
    PreviousPaymentsActions.load()
    this.unsubscribe = PreviousPaymentsStore.listen(this.onChange)
  },
  render: function() {
    return (
      <form className='PreviousPayments' onSubmit={this.onSubmit}>
        <h2>Previous Payments</h2>
        <Table variant='striped'>
          <thead>
          <tr>
            <th>Created</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Source</th>
            </tr>
          </thead>
          <tbody>
        {this.state.payments.map(function(object, i){
          return <tr>
              <td>{moment.unix(object.timestamp).format()}</td>
              <td>${(object.amount/100.0).toFixed(2)}</td>
              <td>{object.status}</td>
              <td>{object.source}</td>
            </tr>;
        })}
        </tbody>
        </Table>
        {this.state.loading && <div>Loading ...</div>}
      </form>
    )
  }
})

module.exports = PreviousPayments
