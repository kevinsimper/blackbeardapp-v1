var React = require('react')
var actions = require('../Apps/actions')
var Navigation = require('react-router').Navigation;
var Input = require('../Input/')
var Button = require('../Button/')

var AppCreate = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      name: '',
      status: ''
    };
  },
  onChangeName: function(e) {
    this.setState({
      name: e.target.value
    })
  },
  onClickCreate: function() {
    var self = this
    actions.new({
      name: this.state.name
    })
    this.setState({
      status: 'App created'
    })
    setTimeout(function() {
      self.transitionTo('/')
    }, 1000)
  },
  render: function() {
    return (
      <div>
        <h1>Create app</h1>
        <Input type="text" value={this.state.name} onChange={this.onChangeName} />
        <div>
          <Button onClick={this.onClickCreate}>Create app</Button>
        </div>
        <div>{this.state.status}</div>
      </div>
    );
  }
})

module.exports = AppCreate
