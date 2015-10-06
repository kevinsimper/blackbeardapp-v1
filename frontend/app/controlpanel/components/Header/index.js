var React = require('react')

var Header = React.createClass({
  render: function () {
    return (
      <div className='Header'>
        {this.props.children}
      </div>
    )
  }
})

module.exports = Header
