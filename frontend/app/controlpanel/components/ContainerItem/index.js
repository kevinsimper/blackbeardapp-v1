var React = require('react')
var Button = require('../Button/')
var ContainerActions = require('../Containers/actions')
var Label = require('../Label/')

var AppsActions = require('../Apps/actions')

var ContainerItem = React.createClass({
  stopContainer: function() {
    ContainerActions.stopOne(this.props.app, this.props.container._id)
  },
  render: function() {
    var containerButton
    if ((this.props.container.status === 'Running') || (this.props.container.status === 'Starting')) {
      containerButton = <Button onClick={this.stopContainer}>Stop</Button>
    } else {
      containerButton = <Button>Start</Button>
    }

    return (
      <div>
        <Label>Region: </Label>
        {this.props.container.region}
        <Label>Status: </Label>
        {this.props.container.status}
        <Label>IP: </Label>
        {this.props.container.ip}

        {containerButton}
      </div>
    );
  }
})

module.exports = ContainerItem
