var React = require('react')
var Reflux = require('reflux')
var actions = require('./actions')
var store = require('./store')
var Table = require('../Table/')
var moment = require('moment')

var UserLogs = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getState: function() {
    return {
      logs: store.getAll()
    }
  },
  getInitialState: function () {
    return this.getState()
  },
  componentDidMount: function () {
    actions.load(this.props.user)
    this.listenTo(store, this.onChange)
  },
  onChange: function () {
    this.setState(this.getState())
  },
  render: function () {
    return (
      <div className='UserLogs'>
        <h2>Logs</h2>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>IP</th>
              <th>Type</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {this.state.logs.map(function (item) {
              return (
                <tr>
                  <td>
                    <span title={moment.unix(item.timestamp).format()}>
                      {moment.unix(item.timestamp).fromNow()}
                    </span>
                  </td>
                  <td>{item.ip}</td>
                  <td>{item.type}</td>
                  <td>{item.data}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    )
  }
})

module.exports = UserLogs
