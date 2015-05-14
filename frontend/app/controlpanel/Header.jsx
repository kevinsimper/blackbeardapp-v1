var React = require('react');
var auth = require('./auth')

var Header = React.createClass({
  render: function() {
    var styles = {
      navigationList: {
        display: 'flex',
        backgroundColor: '#00BFFF'
      },
      item: {
        flex: '1',
        textAlign: 'center'
      },
      link: {
        color: 'white',
        padding: 10,
        display: 'block'
      }
    } 
    return (
      <div>
        <div style={styles.navigationList}>
          <div style={styles.item}>
            <a style={styles.link} href="#/">Dashboard</a>
          </div>
          <div style={styles.item}>
            <a style={styles.link} href="#/profile">My Profile</a>
          </div>
          <div style={styles.item}>
            <a style={styles.link} href="#/preusers">PreUsers</a>
          </div>
          <div style={styles.item}>
            <button onClick={auth.logout}>Log ud</button>
          </div>
        </div> 
      </div>
    );
  }
});

module.exports = Header
