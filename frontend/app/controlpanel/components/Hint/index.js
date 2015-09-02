var React = require('react')

var Hint = React.createClass({
  render: function () {
    return (
      <span className='Hint' data-hint={this.props.message}>
        {this.props.children}
      </span>
    )
  }
})

module.exports = Hint
