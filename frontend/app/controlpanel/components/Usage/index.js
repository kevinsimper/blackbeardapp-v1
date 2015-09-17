var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')
var ContainerItem = require('../ContainerItem/')
var filter = require('lodash/collection/filter')

var store = require('./store')
var actions = require('./actions')

var Usage = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      billing: store.getOne()
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    actions.loadOne()
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
    var self = this

    return (
      <div>
        <h2>Usage</h2>
        <Table>
          <thead>
            <tr>
              <th>Application</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {this.state.billing.map(function(billing) {
              return <tr>
                <td>{billing.name}</td>
                <td>{billing.hours}</td>
              </tr>
            })}
          </tbody>
        </Table>
      </div>
    );
  }
})

module.exports = Usage
