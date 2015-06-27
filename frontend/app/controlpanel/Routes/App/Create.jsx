var React = require('react')
var AppActions = require('./Actions')
var Navigation = require('react-router').Navigation;

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
    AppActions.new({
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
        <input type="text" value={this.state.name} onChange={this.onChangeName} />
        <div>
          <button onClick={this.onClickCreate}>Create app</button>
        </div>
        <div>{this.state.status}</div>
      </div>
    );
  }
})

module.exports = AppCreate