var React = require('react')
var AppStore = require('../Apps/store')
var AppActions = require('../Apps/actions')
var StatusIcon = require('../StatusIcon/')
var filter = require('lodash/collection/filter')

var getState = function() {
  return {
    apps: AppStore.getApps()
  };
}

var AppCreate = React.createClass({
  getInitialState: function() {
    return getState()
  },
  componentDidMount: function() {
    AppActions.load()
    this.unsubscribe = AppStore.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(getState())
  },
  render: function() {
    var activeApps = filter(this.state.apps, {deleted: false}) || []
    var deletedApps = filter(this.state.apps, {deleted: true}) || []
    return (
      <div className='Apps'>
        <div className='Apps__List'>
          {activeApps.map(function(app){
            return (
              <div className='Apps__Item'>
                <a href={'#/apps/' + app._id} className='Apps__Link'>
                  <div className='Apps__StatusIcon'>
                    <StatusIcon/>
                  </div>
                  <div className='Apps__Info'>
                    {app.name}
                    <div className='Apps__Containers'>
                      <small>
                        {app.containers.length} containers running
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
                    <a href={'#/apps/' + app._id} className='Apps__Link'>
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

module.exports = AppCreate
