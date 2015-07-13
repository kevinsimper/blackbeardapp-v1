var React = require('react')
var extend = require('lodash/object/extend')
var AppStore = require('../../Routes/App/Store')
var Actions = require('../../Routes/App/Actions')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')

var Show = React.createClass({
  mixins: [Navigation],
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
  onClickDelete: function() {
    var self = this
    if(!confirm('Are you sure?')) {
      return false
    }
    Actions.del(this.state.app._id)
      .then(function() {
        self.replaceWith('/')
      })
  },
  onClickStart: function() {
    this.transitionTo('/apps/' + this.props.params.id + '/containers')
  },
  onClickStopContainer: function(item) {
    Actions.stopContainer(this.props.params.id, item._id)
  },
  render: function() {
    var self = this
    if(!this.state.loaded) {
      return <div>Loading ...</div>
    }
    return (
      <div className='AppShow'>
        <h1><StatusIcon/>{this.state.app.name}</h1>
        <div>Created: {moment(parseInt(this.state.app.timestamp) * 1000).format()}</div>
        <div className='AppShow__Containers'>
          {this.state.app.containers.map(function(item) {
            var clickFunction = self.onClickStopContainer.bind(self, item)
            return <div>{item.region} <Button onClick={clickFunction}>Stop</Button></div>
          })}
          {this.state.app.containers.length === 0 && 
            <div>No running containers</div>
          }
        </div>
        <Button onClick={this.onClickStart}>Start containers</Button>
        <Button variant='danger' onClick={this.onClickDelete}>Delete</Button>
      </div>
    );
  }
})

module.exports = Show
