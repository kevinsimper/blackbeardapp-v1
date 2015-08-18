var React = require('react');
var auth = require('../../auth')
var Button = require('../Button/')

var Sidebar = React.createClass({
  render: function() {
    return (
      <div className='Sidebar'>
        <div className='Sidebar__Logo'>
          <h2>Blackbeard</h2>
        </div>
        <div className='Sidebar__List'>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/">Dashboard</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/profile">My Profile</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/images">Images</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/preusers">PreUsers</a>
          </div>
          <div className='Sidebar__Item'>
            <a className='Sidebar__Link' href="#/users">Users</a>
          </div>
          <div className='Sidebar__Item' style={{padding: 10}}>
            <Button onClick={auth.logout}>Log ud</Button>
          </div>
        </div> 
      </div>
    );
  }
});

module.exports = Sidebar
