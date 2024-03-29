var React = require('react')
var Actions = require('./actions')
var Store = require('./store')
var Table = require('../Table')
var Button = require('../Button')
var Navigation = require('react-router').Navigation
var moment = require('moment')
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')

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
    this.transitionTo('/controlpanel/users/' + item._id)
  },
  render: function() {
    var self = this
    return (
      <div className='Users'>
        <Header>
          <h1>Users</h1>
        </Header>
        <ContentBlock>
          <Table variant='striped'>
            <thead>
              <tr>
                <th>Email</th>
                <th>Credit</th>
                <th>Timestamp</th>
                <th>Deleted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.users.map(function(item) {
                var handler = self.onClickView.bind(null, item)
                return (
                  <tr>
                    <td>{item.email}</td>
                    <td>{item.credit}</td>
                    <td>
                      <span title={moment.unix(item.timestamp).format()}>
                        {moment.unix(item.timestamp).fromNow()}
                      </span>
                    </td>
                    <td>{item.deleted && <span>Yes</span>}</td>
                    <td>
                      <Button size='small' onClick={handler}>View</Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </ContentBlock>
      </div>
    )
  }
})

module.exports = Users
