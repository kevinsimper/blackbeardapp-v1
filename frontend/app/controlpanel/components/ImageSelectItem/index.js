var React = require('react')
var classNames = require('classnames')
var moment = require('moment')

var ImageSelectItem = React.createClass({
  render: function () {
    var classes = classNames('ImageSelectItem', {
      'ImageSelectItem--unselected': !this.props.selected,
      'ImageSelectItem--selected': this.props.selected
    })
    return (
      <div className={classes} onClick={this.props.onClick}>
        <div>{this.props.image.name}</div>
        <div>
          <small>Last updated {moment.unix(this.props.image.modifiedAt).fromNow()}</small>
        </div>
      </div>
    )
  }
})

module.exports = ImageSelectItem
