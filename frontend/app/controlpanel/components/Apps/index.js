var React = require('react')
var AppStore = require('../Apps/store')
var AppActions = require('../Apps/actions')
var StatusIcon = require('../StatusIcon/')

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
    return (
      <div className='Apps'>
        {this.state.apps.map(function(app){
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
    );
  }
})

module.exports = AppCreate
