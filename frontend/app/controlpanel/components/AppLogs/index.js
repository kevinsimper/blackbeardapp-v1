var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')

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
    return (
      <div>
        <h2>Logs</h2>
        <Table>
          <tbody>
            {this.state.logs.map(function(log) {
              return (
                <tr>
                  <td>Image pushes at {moment.unix(log.timestamp).format()}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    );
  }
})

module.exports = AppLogs
