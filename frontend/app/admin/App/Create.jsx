var React = require('react')
var AppActions = require('./Actions')

var AppCreate = React.createClass({
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
    AppActions.createApp({
      name: this.state.name
    })
    this.setState({
      status: 'App created'
    })
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