var React = require('react')
var Actions = require('./Actions')
var PreUsersStore = require('./Store')
var Authentication = require('../mixins/authentication')

var getState = function() {
  return {
    preUsers: PreUsersStore.getPreUsers()
  }
}

var ListPreUsers = React.createClass({
  mixins: [Authentication],
  getInitialState: function() {
    return getState()
  },
  componentDidMount: function() {
      this.unsubscribe = PreUsersStore.listen(this.onChange);
      Actions.load()
  },
  componentWillUnmount: function() {
      this.unsubscribe();
  },
  onChange: function() {
    this.setState(getState())
  },
  onClickDeletePreUser: function(i) {
    Actions.del(this.state.preUsers[i]._id)
  },
  render: function() {
    var self = this
    return (
      <div>
        <h1>PreUsers</h1>
        <table>
          <tr>
            <th>Email</th>
            <th>IP</th>
            <th>Active</th>
            <th>Comment</th>
            <th>Actions</th>
          </tr>
          {this.state.preUsers.map(function(preUser, i) {

            return (
              <tr>
                <td>{preUser.email}</td>
                <td>{preUser.ip}</td>
                <td>{preUser.active}</td>
                <td>{preUser.comment}</td>
                <td>
                  <button onClick={self.onClickDeletePreUser.bind(this, i)}>Delete</button>
                </td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
})

module.exports = ListPreUsers