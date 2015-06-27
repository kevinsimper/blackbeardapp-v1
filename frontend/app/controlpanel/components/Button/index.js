var React = require('react')

var Button = React.createClass({
  render: function() {
    return (
      <button className="Button" {...this.props}>{this.props.children}</button>
    )
  }
})

module.exports = Button