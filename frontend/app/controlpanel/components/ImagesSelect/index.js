var React = require('react')
var Button = require('../Button/')
var Select = require('../Select/')

var ImagesSelect = React.createClass({
  onChange: function(e) {
    this.props.onChange(e.target.value)
  },
  render: function() {
    return (
      <Select onChange={this.onChange}>
        <option value=''>- Choose Image -</option>
        {this.props.images.map(function(image) {
          return <option value={image._id}>{image.name}</option>
        })}
      </Select>
    )
  }
})

module.exports = ImagesSelect
