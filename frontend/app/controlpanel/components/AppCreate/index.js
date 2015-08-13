var React = require('react')
var extend = require('lodash/object/extend')
var AppActions = require('../Apps/actions')
var AppStore = require('../Apps/store')
var ImageActions = require('../Images/actions')
var ImageStore = require('../Images/store')
var Navigation = require('react-router').Navigation;
var Input = require('../Input/')
var Label= require('../Label/')
var Button = require('../Button/')
var ImagesSelect = require('../ImagesSelect/index')

var AppCreate = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      images: ImageStore.getImages()
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false,
      name: '',
      image: ''
    })
  },
  onChange: function() {
    this.setState(this.getState())
  },
  componentDidMount: function() {
    ImageActions.load()
    AppActions.load()
    this.unsubscribe = AppStore.listen(this.onChange)
    this.unsubscribeImage = ImageStore.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
    this.unsubscribeImage()
  },
  onChangeName: function(e) {
    this.setState({
      name: e.target.value
    })
  },
  onChangeImage: function(image) {
    this.setState({
      image: image
    })
  },
  onSubmit: function(e) {
    e.preventDefault()
    var self = this
    this.setState({
      loading: true
    })
    AppActions.new(this.state)
      .then(function() {
        self.setState({
          loading: false
        })
      })
  },
  render: function() {
    return (
      <form className="App" onSubmit={this.onSubmit}>
        <h1>Create app</h1>
        <Label>Name</Label>
        <Input type="text" value={this.state.name} onChange={this.onChangeName} />
        <Label>Image</Label>
        <ImagesSelect images={this.state.images} value={this.state.image} onChange={this.onChangeImage}/>
        <div>
          <Button>Create app</Button>
        </div>
        <div>{this.state.status}</div>
      </form>
    );
  }
})

module.exports = AppCreate
