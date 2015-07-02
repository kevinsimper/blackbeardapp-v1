var React = require('react')

var Label = React.createClass({
  render: function() {
    return (
      <div>
        <label className='Label'>
          {this.props.children}
        </label>
      </div>
    )
  }
})

module.exports = Label
