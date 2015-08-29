var React = require('react')

var TextArea = React.createClass({
  render: function() {
    return (
      <textarea className='TextArea' {...this.props}/>
    )
  }
})

module.exports = TextArea
