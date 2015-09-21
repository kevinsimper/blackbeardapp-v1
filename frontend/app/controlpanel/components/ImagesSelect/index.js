var React = require('react')
var Button = require('../Button/')
var Input = require('../Input')
var ImageSelectItem = require('../ImageSelectItem/')
var filter = require('lodash/collection/filter')

var ImagesSelect = React.createClass({
  onChange: function(imageId) {
    this.props.onChange(imageId)
  },
  getLatestFive: function () {
    return filter(this.props.images, function (image) {
      return image.modifiedAt
    }).reverse().slice(0, 5)
  },
  render: function() {
    var self = this
    return (
      <div className='ImagesSelect'>
        <div>
          {this.getLatestFive().map(function(image) {
            return <ImageSelectItem key={image._id} image={image} selected={self.props.value === image._id} onClick={self.onChange.bind(null, image._id)}/>
          })}
        </div>
      </div>
    )
  }
})

module.exports = ImagesSelect
