var React = require('react')
var Link = require('react-router').Link

var AppsList = React.createClass({
  render: function() {
    var apps = [{name: 'awesome-app'}, {name: 'docker-fun'}]
    return (
      <div>
        <Link to='/app/create'>Create new app</Link>
        <h3>My Apps</h3>
        <div>
          {apps.map(function(item){
            return <div>{item.name}</div>;
          })}
        </div>
      </div>
    );
  }
})

module.exports = AppsList