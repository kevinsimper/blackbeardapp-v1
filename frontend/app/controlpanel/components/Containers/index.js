var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')

ContainerItem = require('../ContainerItem/')

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
    var containers = []

    if (this.state.containers) {
      this.state.containers.forEach(function(container) {
        containers.push(<ContainerItem app={self.props.app} container={container} />)
      }.bind(this));
    }

    return (
      <div>
        <h2>Containers</h2>
        {containers}
      </div>
    );
  }
})

module.exports = Containers
