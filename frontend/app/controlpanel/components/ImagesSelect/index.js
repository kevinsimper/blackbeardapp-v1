var React = require('react')
var Button = require('../Button/')

var ImagesSelect = React.createClass({
  onChange: function(e) {
    this.props.onChange(e.target.value)
  },
  render: function() {
    return (
      <select onChange={this.onChange}>
        <option value=''>- Choose Image -</option>
        {this.props.images.map(function(image) {
          return <option value={image._id}>{image.name}</option>
        })}
      </select>
    )
  }
})

module.exports = ImagesSelect
