var React = require('react')
var Router = require('react-router')
var Store = require('./Store')

var getState = function() {
  return {
    preUser: {}
  };
}

var PreUsersShow = React.createClass({
  mixins: [Router.State],
  getInitialState: function() {
    return getState()
  },
  componentDidMount: function() {
      this.unsubscribe = Store.listen(this.onChange);
      Actions.load()
  },
  componentWillUnmount: function() {
      this.unsubscribe();
  },
  onChange: function() {
    this.setState(getState())
  },
  render: function() {
    var id = this.getParams().id
    return (
      <div>
        <h2>Show</h2>
        <div>{id}</div>
      </div>
    );
  }
})

module.exports = PreUsersShow
