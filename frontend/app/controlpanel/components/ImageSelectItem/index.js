var React = require('react')
var classNames = require('classnames')

var ImageSelectItem = React.createClass({
  render: function () {
    var classes = classNames('ImageSelectItem', {
      'ImageSelectItem--unselected': !this.props.selected,
      'ImageSelectItem--selected': this.props.selected
    })
    return (
      <div className={classes} onClick={this.props.onClick}>
        {this.props.image.name}
      </div>
    )
  }
})

module.exports = ImageSelectItem
