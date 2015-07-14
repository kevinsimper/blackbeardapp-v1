var React = require('react')
var Actions = require('./Actions')
var PreUsersStore = require('./Store')
var Authentication = require('../../mixins/authentication')
var PreUsersItem = require('./Item.jsx')
var Table = require('../../components/Table/')

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
  render: function() {
    var self = this
    return (
      <div>
        <h1>PreUsers</h1>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Email</th>
              <th>IP</th>
              <th>Active</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.preUsers.map(function(preUser, i) {
              return <PreUsersItem preUser={preUser} key={i} />;
            })}
          </tbody>
        </Table>
      </div>
    );
  }
})

module.exports = ListPreUsers
