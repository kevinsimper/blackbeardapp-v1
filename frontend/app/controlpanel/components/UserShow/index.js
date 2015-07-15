var React = require('react')
var store = require('./store')
var actions = require('./actions')
var Table = require('../Table/')
var Button = require('../Button/')
var Input = require('../Input/')
var moment = require('moment')

var UserShow = React.createClass({
  getState: function() {
    return store.getUser()
  },
  getInitialState: function() {
    return this.getState()
  },
  componentDidMount: function() {
    actions.load(this.props.params.id)
    this.unsubscribe = store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  onClickSave: function() {

  },
  onClickDelete: function() {
    if(confirm('Do you want to delete this user?')) {
      alert('deleted!')
    }
  },
  render: function() {
    return (
      <div className="UserShow">
        <h2>User</h2>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Id</td>
              <td>{this.state._id}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td><Input value={this.state.email}/></td>
            </tr>
            <tr>
              <td>Credit</td>
              <td><Input value={this.state.credit}/></td>
            </tr>
            <tr>
              <td>Role</td>
              <td>
                <select value={this.state.email}>
                  <option value='USER'>User</option>
                  <option value='ADMIN'>Admin</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Created</td>
              <td>{moment.unix(this.state.timestamp).format()} - {moment.unix(this.state.timestamp).fromNow()}</td>
            </tr>
            <tr>
              <td>IP when signed up</td>
              <td>{this.state.ip}</td>
            </tr>
          </tbody>
        </Table>
        <div>
          <Button variant='danger' onClick={this.onClickDelete}>Delete</Button>
          <Button onClick={this.onClickSave}>Save</Button>
        </div>
      </div>
    )
  }
})

module.exports = UserShow
