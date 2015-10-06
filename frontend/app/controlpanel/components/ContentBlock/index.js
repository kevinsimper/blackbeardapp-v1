var React = require('react')

var ContentBlock = React.createClass({
  render: function () {
    return (
      <div className='ContentBlock'>
        {this.props.children}
      </div>
    )
  }
})

module.exports = ContentBlock
