var React = require('react')
var classNames = require('classnames')

var Table = React.createClass({
  render: function() {
    var classes = classNames('Table', {
      'Table__striped': this.props.variant === 'striped'
    })
    return (
      <div className={classes}>
        <table>
          {this.props.children}
        </table>
      </div>
    )
  }
})

module.exports = Table
