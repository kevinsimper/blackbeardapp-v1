var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')

var store = require('./store')
var actions = require('./actions')

var AppLogs = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      logs: store.getOne(this.props.app)
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    actions.loadOne(this.props.app)
      .then(function() {
        self.setState({
          loaded: true
        })
      })
    this.unsubscribe = store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    var logs = []
    this.state.logs.forEach(function(log) {
      logs.push(<li>Image pushes at {moment(parseInt(log.timestamp) * 1000).format()}</li>)
    }.bind(this));

    return (
      <div>
        <h2>Logs</h2>
        <ul>
          {logs}
        </ul>
      </div>
    );
  }
})

module.exports = AppLogs
