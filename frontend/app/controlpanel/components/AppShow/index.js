var React = require('react')
var extend = require('lodash/object/extend')
var request = require('superagent')
var moment = require('moment')
var Navigation = require('react-router').Navigation
var config = require('../../config')
var AppsStore = require('../Apps/store')
var AppsActions = require('../Apps/actions')
var AppLogs = require('../AppLogs/')
var Containers = require('../Containers/')
var ContainerActions = require('../Containers/actions')
var ContainerStore = require('../Containers/store')
var Button = require('../Button/')
var StatusIcon = require('../StatusIcon/')
var TimeSince = require('../TimeSince/')
var filter = require('lodash/collection/filter')

var AppShow = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      app: AppsStore.getOneApp(this.props.params.id),
      containers: ContainerStore.getOne(this.props.params.id)
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    AppsActions.load()
      .then(function() {
        self.setState({
          loaded: true
        })
      })
    ContainerActions.loadOne(this.props.app)
      .then(function() {
        self.setState({
          loaded: true
        })
      })

    this.unsubscribe = AppsStore.listen(this.onChange)
    this.unsubscribeContainers = ContainerStore.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
    this.unsubscribeContainers()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  onClickDelete: function() {
    var self = this
    if(!confirm('Are you sure?')) {
      return false
    }
    AppsActions.del(this.state.app._id)
      .then(function() {
        self.replaceWith('/')
      })
  },
  onClickStart: function() {
    this.transitionTo('/apps/' + this.props.params.id + '/containers')
  },
  render: function() {
    var self = this
    if(!this.state.loaded) {
      return <div>Loading ...</div>
    }

    var runningContainers = filter(this.state.containers, {deleted: false}) || []

    return (
      <div className='AppShow'>
        <h1><StatusIcon/>{this.state.app.name}</h1>
        <div>
          <span>Created&nbsp;</span>
          <TimeSince timestamp={this.state.app.timestamp}/>
        </div>
        <div>
          <Button onClick={this.onClickStart}>Start Container</Button>
          {runningContainers.length === 0 &&
            <Button variant='danger' onClick={this.onClickDelete}>Delete App</Button>
          }
        </div>
        <Containers app={this.state.app._id} />
        <AppLogs app={this.state.app._id} />
      </div>
    );
  }
})

module.exports = AppShow
