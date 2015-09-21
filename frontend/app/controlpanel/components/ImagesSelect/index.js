var React = require('react')
var Button = require('../Button/')
var Input = require('../Input')
var ImageSelectItem = require('../ImageSelectItem/')
var filter = require('lodash/collection/filter')

var ImagesSelect = React.createClass({
  getInitialState: function () {
    return {
      search: ''
    }
  },
  onChange: function(imageId) {
    this.props.onChange(imageId)
  },
  getLatestFive: function () {
    var self = this
    var ordered = filter(this.props.images, function (image) {
      return image.modifiedAt
    }).reverse()
    if(this.state.search.length > 0) {
      return filter(ordered, function (image) {
        if(image.name.indexOf(self.state.search) !== -1) {
          return image
        }
      }).slice(0, 5)
    } else {
      return ordered.slice(0, 5)
    }
  },
  onSearchChange: function (e) {
    this.setState({
      search: e.target.value
    })
  },
  render: function() {
    var self = this
    return (
      <div className='ImagesSelect'>
        <div>
          <Input type='text' placeholder='Quick Search' value={this.state.search} onChange={this.onSearchChange}/>
        </div>
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
