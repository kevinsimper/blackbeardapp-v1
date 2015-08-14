var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')
var ContainerItem = require('../ContainerItem/')

var store = require('./store')
var actions = require('./actions')

var Containers = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      containers: store.getOne(this.props.app)
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
    var self = this

    return (
      <div>
        <h2>Containers</h2>
        <Table>
          <thead>
            <tr>
              <th>Region</th>
              <th>Status</th>
              <th>IP</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.containers.map(function(container) {
              return <ContainerItem app={self.props.app} container={container} />
            })}
          </tbody>
        </Table>
      </div>
    );
  }
})

module.exports = Containers
