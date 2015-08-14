var React = require('react')
var store = require('./store')
var actions = require('./actions')
var Table = require('../Table/')
var Button = require('../Button/')
var Input = require('../Input/')
var moment = require('moment')
var Navigation = require('react-router').Navigation
var UserLogs = require('../UserLogs/')

var UserShow = React.createClass({
  mixins: [React.addons.LinkedStateMixin, Navigation],
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
    actions.save(this.state)
  },
  onClickDeactivate: function() {
    var self = this
    if(confirm('Do you want to deactivate this user?')) {
      actions.del(this.props.params.id)
      .then(function() {
        self.transitionTo('/users')
      })
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
              <td><Input valueLink={this.linkState('email')}/></td>
            </tr>
            <tr>
              <td>Credit</td>
              <td><Input valueLink={this.linkState('credit')}/></td>
            </tr>
            <tr>
              <td>Role</td>
              <td>
                <select valueLink={this.linkState('role')}>
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
            <tr>
              <td>Deleted</td>
              <td>{this.state.deleted && <span>Yes</span>}</td>
            </tr>
          </tbody>
        </Table>
        <div>
          <Button variant='danger' onClick={this.onClickDeactivate}>Deactivate</Button>
          <Button onClick={this.onClickSave}>Save</Button>
        </div>
        <UserLogs user={this.props.params.id}/>
      </div>
    )
  }
})

module.exports = UserShow
