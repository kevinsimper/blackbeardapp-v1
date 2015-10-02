var React = require('react')
var Actions = require('./Actions')
var Router = require('react-router')
var Link = Router.Link

var PreUsersItem = React.createClass({
  onClickDeletePreUser: function(id) {
    Actions.del(id)
  },
  render: function() {
    var preUser = this.props.preUser
    return (
      <tr>
        <td>
          <Link to={'/controlpanel/preusers/' + preUser._id}>{preUser.email}</Link>
        </td>
        <td>{preUser.ip}</td>
        <td>{preUser.active}</td>
        <td>{preUser.comment}</td>
        <td>
          <button onClick={this.onClickDeletePreUser.bind(this, preUser._id)}>Delete</button>
        </td>
      </tr>
    );
  }
})

module.exports = PreUsersItem
