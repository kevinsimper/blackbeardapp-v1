var React = require('react')
var Button = require('../Button/')
var ContainerActions = require('../Containers/actions')
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
      <tr>
        <td>{this.props.container.region}</td>
        <td>{this.props.container.status}</td>
        <td>{this.props.container.ip}</td>
        <td>{containerButton}</td>
      </tr>
    );
  }
})

module.exports = ContainerItem
