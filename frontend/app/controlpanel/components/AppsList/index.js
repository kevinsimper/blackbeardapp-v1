var React = require('react')
var Link = require('react-router').Link
var AppStore = require('../../Routes/App/Store')
var AppActions = require('../../Routes/App/Actions')
var StatusIcon = require('../StatusIcon/')

var getState = function() {
  return {
    apps: AppStore.getApps()
  };
}

var AppsList = React.createClass({
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
      <div className='AppsList'>
        <Link to='/app/create'>Create new app</Link>
        <h3>My Apps</h3>
        <div>
          {this.state.apps.map(function(item){
            return (
              <div className='AppsList__Item'>
                <Link className='AppsList__Link' to='AppShow' params={{id: item._id}}>
                  <StatusIcon/>
                  {item.name}
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    );
  }
})

module.exports = AppsList
