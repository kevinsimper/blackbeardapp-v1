var React = require('react')

var SuccessMessage = React.createClass({
  render: function () {
    return (
      <div className='SuccessMessage'>
        {this.props.children}
      </div>
    )
  }
})

module.exports = SuccessMessage
