var React = require('react/addons')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Button = require('../Button')
var Table = require('../Table')
var Link = require('react-router').Link
var Label = require('../Label')
var CreditLogsActions = require('./actions')
var CreditLogsStore = require('./store')
var moment = require('moment')

var CreditLogs = React.createClass({
  getState: function() {
    return {
      creditLogs: CreditLogsStore.getCreditLogs()
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
    CreditLogsActions.load()
    this.unsubscribe = CreditLogsStore.listen(this.onChange)
  },
  render: function() {
    return (
      <div>
        <h2>Credit Logs</h2>
        <Table variant='striped'>
          <thead>
          <tr>
            <th>Created</th>
            <th>User</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Source</th>
            </tr>
          </thead>
          <tbody>
        {this.state.creditLogs.map(function(object, i){
          return <tr>
              <td>{moment.unix(object.timestamp).format()}</td>
              <td>
                <Link className='Users__Link' to={'/controlpanel/users/' + object.user._id}>
                  {object.user.email}
                </Link>
              </td>
              <td>${(object.amount / 100).toFixed(2)}</td>
              <td>{object.status}</td>
              <td>{object.source}</td>
            </tr>;
        })}
        </tbody>
        </Table>
        {this.state.loading && <div>Loading ...</div>}
      </div>
    )
  }
})

module.exports = CreditLogs
