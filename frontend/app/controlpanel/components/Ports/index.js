var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')
var Select = require('../Select/')
var ContainerItem = require('../ContainerItem/')
var filter = require('lodash/collection/filter')

var Ports = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      port: ''
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false,
    })
  },
  onClickPort: function() {
    this.setState(this.getState())
    console.log(this.props.port)
  },
  render: function() {
    var self = this
    return (
      <div>
        <h2>Ports</h2>
        <Select valueLink={this.props.port}>
          {this.props.availablePorts.map(function(port) {
            return <option value={port}>{port}</option>
          })}
        </Select>
        &nbsp;
        <Button onClick={this.onClickPort}>Select</Button>
      </div>
    );
  }
})

module.exports = Ports
