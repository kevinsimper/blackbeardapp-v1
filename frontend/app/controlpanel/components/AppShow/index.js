var React = require('react')
var extend = require('lodash/object/extend')

var AppsStore = require('../Apps/store')
var AppsActions = require('../Apps/actions')

var AppLogs = require('../AppLogs/')

var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')

var request = require('superagent')
var config = require('../../config')

var AppShow = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      app: AppsStore.getOneApp(this.props.params.id)
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

    this.unsubscribe = AppsStore.listen(this.onChange)
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
    AppsActions.del(this.state.app._id)
      .then(function() {
        self.replaceWith('/')
      })
  },
  onClickStart: function() {
    this.transitionTo('/apps/' + this.props.params.id + '/containers')
  },
  onClickStopContainer: function(item) {
    AppsActions.stopContainer(this.props.params.id, item._id)
  },
  render: function() {
    var self = this
    if(!this.state.loaded) {
      return <div>Loading ...</div>
    }

    // get container
    var ContainerItem = React.createClass({
      render: function() {
        //var clickFunction = self.onClickStopContainer.bind(self, item)
        //return <div>{item.region} <Button onClick={clickFunction}>Stop</Button></div>

        return (
          <div>
            Container {this.props.container}
            <Button>Stop</Button>
          </div>
        );
      }
    })

    var Containers = React.createClass({
      render: function() {
        var containers = []
        this.props.containers.forEach(function(container) {
          containers.push(<ContainerItem container={container} />)
        }.bind(this));

        return (
          <div>
            <h2>Containers</h2>
            {containers}
          </div>
        );
      }
    });

    return (
      <div className='AppShow'>
        <h1><StatusIcon/>{this.state.app.name}</h1>
        <div>Created: {moment(parseInt(this.state.app.timestamp) * 1000).format()}</div>

        <Containers containers={this.state.app.containers} />
        <AppLogs app={this.state.app._id} />

        <Button onClick={this.onClickStart}>Start containers</Button>
        <Button variant='danger' onClick={this.onClickDelete}>Delete</Button>
      </div>
    );
  }
})

module.exports = AppShow
