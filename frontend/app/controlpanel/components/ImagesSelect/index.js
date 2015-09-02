var React = require('react')
var Button = require('../Button/')
var ImageSelectItem = require('../ImageSelectItem/')

var ImagesSelect = React.createClass({
  onChange: function(imageId) {
    this.props.onChange(imageId)
  },
  render: function() {
    var self = this
    return (
      <div className='ImagesSelect'>
        {this.props.images.map(function(image) {
          return <ImageSelectItem key={image._id} image={image} selected={self.props.value === image._id} onClick={self.onChange.bind(null, image._id)}/>
        })}
      </div>
    )
  }
})

module.exports = ImagesSelect
