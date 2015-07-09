var React = require('react')
var classNames = require('classnames')

var Button = React.createClass({
  render: function() {
    var classes = classNames('Button', {
      'Button--danger': this.props.variant === 'danger'
    })
    return (
      <button className={classes} {...this.props}>{this.props.children}</button>
    )
  }
})

module.exports = Button
