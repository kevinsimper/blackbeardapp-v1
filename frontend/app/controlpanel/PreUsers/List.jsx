var React = require('react')
var PreUsersActions = require('./Actions')
var PreUsersStore = require('./Store')

var getState = function() {
  return {
    preUsers: PreUsersStore.getPreUsers()
  }
}

var ListPreUsers = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentDidMount: function() {
      this.unsubscribe = PreUsersStore.listen(this.onChange);
      PreUsersActions.load()
  },
  componentWillUnmount: function() {
      this.unsubscribe();
  },
  onChange: function() {
    this.setState(getState())
  },
  render: function() {
    return (
      <div>
        <h1>PreUsers</h1>
        <table>
          <th>
            <td>Email</td>
            <td>IP</td>
            <td>Active</td>
          </th>
          {this.state.preUsers.map(function(item) {

            return (
              <tr>
                <td>{item.email}</td>
                <td>{item.ip}</td>
                <td>{item.active}</td>
              </tr>
            );
          })}
        </table>
      </div>
    );
  }
})

module.exports = ListPreUsers