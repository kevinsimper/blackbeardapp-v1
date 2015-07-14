var React = require('react')
var Actions = require('./actions')
var Store = require('./store')
var Table = require('../Table')
var Button = require('../Button')
var Navigation = require('react-router').Navigation

var Users = React.createClass({
  mixins: [Navigation],
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
  onClickView: function(item) {
    this.transitionTo('/users/' + item._id)
  },
  render: function() {
    var self = this
    return (
      <div className='Users'>
        <h1>Users</h1>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Email</th>
              <th>Credit</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.users.map(function(item) {
              var handler = self.onClickView.bind(this, item)
              return (
                <tr>
                  <td>{item.email}</td>
                  <td>{item.credit}</td>
                  <td>{item.timestamp}</td>
                  <td>
                    <Button size='small' onClick={handler}>View</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    )
  }
})

module.exports = Users
