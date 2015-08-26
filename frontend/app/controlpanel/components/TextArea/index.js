var React = require('react')

module.exports = React.createClass({
  render: function() {
    return (
      <textarea className='TextArea' {...this.props}>{this.value}</textarea>
    )
  }
})
