var React = require('react')

var ButtonGroup = React.createClass({
  render: function () {
    return (
      <div className='ButtonGroup'>
        {this.props.children.map(function (child) {
          return (
            <div className='ButtonGroup__Button'>
              {child}
            </div>
          )
        })}
      </div>
    )
  }
})

module.exports = ButtonGroup
