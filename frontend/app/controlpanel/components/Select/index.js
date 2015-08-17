var React = require('react')

var Select = React.createClass({
  render: function() {
    return (
      <select className='Select' {...this.props}>
        {this.props.children}
      </select>
    )
  }
})

module.exports = Select
