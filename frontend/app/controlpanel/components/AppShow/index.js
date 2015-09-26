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
var ImagesActions = require('../Images/actions')
var ImagesStore = require('../Images/store')
var Button = require('../Button/')
var StatusIcon = require('../StatusIcon/')
var TimeSince = require('../TimeSince/')
var filter = require('lodash/collection/filter')
var Reflux = require('reflux')
var ButtonGroup = require('../ButtonGroup')

var AppShow = React.createClass({
  mixins: [Navigation, Reflux.ListenerMixin],
  getState: function() {
    var imageId = this.state && this.state.app && this.state.app.image || ''
    var image = ImagesStore.getOne(imageId)
    return {
      app: AppsStore.getOneApp(this.props.params.id),
      containers: ContainerStore.getOne(this.props.params.id),
      image: image
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

    this.listenTo(AppsStore, this.onChange)
    this.listenTo(ContainerStore, this.onChange)
    this.listenTo(ImagesStore, this.onChange)
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
  onClickEdit: function () {
    this.transitionTo('/apps/' + this.props.params.id + '/edit')
  },
  render: function() {
    var self = this
    if(!this.state.loaded) {
      return <div>Loading ...</div>
    }

    var runningContainers = filter(this.state.containers, {deleted: false}) || []
    var upContainers = filter(this.state.containers, {deleted: false, status: 'UP'}) || []

    return (
      <div className='AppShow'>
        <h1><StatusIcon/>{this.state.app.name}</h1>
        <div>
          <div>
            <span>Image:&nbsp;</span>
            <span> {this.state.image && this.state.image.name}</span>
          </div>
          <div>
            <span>Created:&nbsp;</span>
            <TimeSince timestamp={this.state.app.timestamp}/>
          </div>
          <div>
            <span>URL:&nbsp;</span>
            {upContainers.length !== 0 &&
            <a target='_BLANK' href={'http://' + this.state.app.name + '.blackbeardapps.com'}>
              http://{this.state.app.name}.blackbeardapps.com
            </a>
            }
            {upContainers.length === 0 &&
            <span>-</span>
            }
          </div>
        </div>
        <div>
          <ButtonGroup>
            <Button onClick={this.onClickStart}>Start Container</Button>
            <Button onClick={this.onClickEdit}>Edit</Button>
            {runningContainers.length === 0 &&
              <Button variant='danger' onClick={this.onClickDelete}>Delete App</Button>
            }
          </ButtonGroup>
        </div>
        <Containers app={this.state.app._id} />
        <AppLogs app={this.state.app._id} />
      </div>
    );
  }
})

module.exports = AppShow
