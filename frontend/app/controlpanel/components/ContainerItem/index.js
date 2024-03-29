var React = require('react')
var Button = require('../Button/')
var ContainerActions = require('../Containers/actions')
var AppsActions = require('../Apps/actions')

var ContainerItem = React.createClass({
  stopContainer: function() {
    ContainerActions.delOne(this.props.app, this.props.container._id)
  },
  getContainerButton: function () {
    if (this.props.container.status === 'UP') {
      return <Button onClick={this.stopContainer}>Stop</Button>
    }
    return '-'
  },
  render: function() {
    return (
      <tr>
        <td>{this.props.container.status}</td>
        <td>
          {this.props.container.ip &&
          <a target='_BLANK' href={'http://' + this.props.container.ip + ':' + this.props.container.port}>
            {this.props.container.ip}:{this.props.container.port}
          </a>
          }
          {!this.props.container.ip &&
          <span>-</span>
          }
        </td>
        <td>{this.getContainerButton()}</td>
      </tr>
    );
  }
})

module.exports = ContainerItem
