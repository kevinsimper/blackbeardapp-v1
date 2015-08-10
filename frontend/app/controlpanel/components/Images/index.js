var React = require('react')

var actions = require('./actions')
var store = require('./store')

var moment = require('moment')

var Images = React.createClass({
  getInitialState: function() {
    return this.getState()
  },
  getState: function() {
    return {
      images: store.getImages()
    }
  },
  componentDidMount: function() {
    actions.load()
    this.unsubscribe = store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    return (
      <div className='Images'>
        <h2>Images</h2>
        <ul>
        {this.state.images.map(function(image) {
          return <li>{image.name} <sup>{moment.unix(image.createdAt).format()}</sup></li>
        })}
        </ul>
      </div>
    )
  }
})

module.exports = Images
