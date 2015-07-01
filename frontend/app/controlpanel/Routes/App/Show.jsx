var React = require('react')
var extend = require('lodash/object/extend')
var AppStore = require('./Store')
var Actions = require('./Actions')
var moment = require('moment')

var Show = React.createClass({
  getState: function() {
    return {
      app: AppStore.getOneApp(this.props.params.id)
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    Actions.load()
    .then(function() {
      self.setState({
        loaded: true
      })
    })
    this.unsubscribe = AppStore.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    if(!this.state.loaded) {
      return <div>Loading ...</div>
    }
    return (
      <div>
        <h1>{this.state.app.name}</h1>
        <div>Created: {moment(parseInt(this.state.app.timestamp) * 1000).format()}</div>
      </div>
    );
  }
})

module.exports = Show
