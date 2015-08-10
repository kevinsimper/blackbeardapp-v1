var React = require('react')
var Link = require('react-router').Link
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
        <Link to='/apps/create'>Create new app</Link>
        <h3>My Apps</h3>
        <div>
          {this.state.apps.map(function(item){
            return (
              <div className='Apps__Item'>
                <Link className='Apps__Link' to='AppShow' params={{id: item._id}}>
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

module.exports = AppCreate
