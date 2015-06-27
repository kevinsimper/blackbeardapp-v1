var React = require('react')

var Input = React.createClass({
  render: function() {
    return (
      <input className='Input' {...this.props}/>
    )
  }
})

module.exports = Input