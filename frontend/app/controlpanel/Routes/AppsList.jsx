var React = require('react')
var Link = require('react-router').Link
var AppStore = require('./App/Store')
var AppActions = require('./App/Actions')

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
      <div>
        <Link to='/app/create'>Create new app</Link>
        <h3>My Apps</h3>
        <div>
          {this.state.apps.map(function(item){
            return (
              <div>
                <Link to='AppShow' params={{id: item._id}}>{item.name}</Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
})

module.exports = AppsList