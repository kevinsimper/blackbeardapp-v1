var React = require('react');

var Header = React.createClass({
  render: function() {
    return (
      <div>
        <ul>
          <li><a href="#/">Dashboard</a></li>
          <li><a href="#/profile">My Profile</a></li>
        </ul> 
      </div>
    );
  }
});

module.exports = Header
