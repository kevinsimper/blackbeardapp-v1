var React = require('react')
var Actions = require('./actions')
var Store = require('./store')

var Users = React.createClass({
  getState: function() {
    return {
      users: Store.getUsers()
    }
  },
  getInitialState: function() {
    return this.getState()
  },
  componentDidMount: function() {
    Actions.load()
    this.unsubscribe = Store.listen(this.onChange)
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    return (
      <div className='Users'>
        <h1>Users</h1>
        <table style={{width: '100%'}}>
          <tr>
            <th>Email</th>
            <th>Credit</th>
            <th>Timestamp</th>
          </tr>
          {this.state.users.map(function(item) {
            return (
              <tr>
                <td>{item.email}</td>
                <td>{item.credit}</td>
                <td>{item.timestamp}</td>
              </tr>
            )
          })}
        </table>
      </div>
    )
  }
})

module.exports = Users
