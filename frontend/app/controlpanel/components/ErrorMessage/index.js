var React = require('react')

var ErrorMessage = React.createClass({
  render: function() {
    return (
      <div className='ErrorMessage'>
        {this.props.children}
      </div>
    )
  }
})

module.exports = ErrorMessage
