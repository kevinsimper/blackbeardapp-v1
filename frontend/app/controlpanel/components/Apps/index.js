var React = require('react')
var Reflux = require('reflux')
var AppStore = require('../Apps/store')
var AppActions = require('../Apps/actions')
var ContainersStore = require('../Containers/store')
var ContainersAction = require('../Containers/actions')
var StatusIcon = require('../StatusIcon/')
var filter = require('lodash/collection/filter')
var Navigation = require('react-router').Navigation

var getState = function() {
  return {
    apps: AppStore.getApps(),
    containers: ContainersStore.getAllActive()
  };
}

var Apps = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
  getInitialState: function() {
    return getState()
  },
  componentDidMount: function() {
    AppActions.load().then(function (apps) {
      apps.forEach(function (app) {
        ContainersAction.loadOne(app._id)
      })
    })
    this.listenTo(AppStore, this.onChange)
    this.listenTo(ContainersStore, this.onChange)
  },
  onChange: function() {
    this.setState(getState())
  },
  onClickApp: function (app, e) {
    e.preventDefault()
    this.transitionTo('/controlpanel/apps/' + app._id)
  },
  render: function() {
    var self = this
    var activeApps = filter(this.state.apps, {deleted: false}) || []
    var deletedApps = filter(this.state.apps, {deleted: true}) || []
    return (
      <div className='Apps'>
        <div className='Apps__List'>
          {activeApps.map(function(app){
            return (
              <div className='Apps__Item'>
                <a href={'/controlpanel/apps/' + app._id} className='Apps__Link' onClick={self.onClickApp.bind(null, app)}>
                  <div className='Apps__StatusIcon'>
                    <StatusIcon/>
                  </div>
                  <div className='Apps__Info'>
                    {app.name}
                    <div className='Apps__Containers'>
                      <small>
                        {self.state.containers[app._id] && self.state.containers[app._id].length} containers running
                      </small>
                    </div>
                  </div>
                </a>
              </div>
            )
          })}
        </div>
        <div className='Apps__List'>
          {deletedApps.length !== 0 &&
            <div>
              <h2>Deleted Apps</h2>
              {deletedApps.map(function (app) {
                return (
                  <div className='Apps__Item'>
                    <a href={'/controlpanel/apps/' + app._id} className='Apps__Link' onClick={self.onClickApp.bind(null, app)}>
                      {app.name}
                    </a>
                  </div>
                )
              })}
            </div>
          }
        </div>
      </div>
    );
  }
})

module.exports = Apps
