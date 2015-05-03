var React = require('react')
var Link = require('react-router').Link
var AppStore = require('./App/Store')

var getState = function() {
  return {
    apps: AppStore.getApps()
  };
}

var AppsList = React.createClass({
  getInitialState: function() {
    return getState()
  },
  render: function() {
    return (
      <div>
        <Link to='/app/create'>Create new app</Link>
        <h3>My Apps</h3>
        <div>
          {this.state.apps.map(function(item){
            return <div>{item.name}</div>;
          })}
        </div>
      </div>
    );
  }
})

module.exports = AppsList