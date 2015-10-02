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
var ErrorMessage = require('../ErrorMessage/')
var Select = require('../Select')

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
      image: '',
      exposedPorts: [],
      status: '',
      ports: []
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
    // Get ports from image.
    // Sort them and set the default selected port to the first one.
    var imageObject = ImageStore.getOne(image)
    var ports = []
    var exposedPorts = []
    if (imageObject.exposedPorts && (imageObject.exposedPorts instanceof Array) &&
      (imageObject.exposedPorts.length > 0)) {
      exposedPorts = imageObject.exposedPorts.sort(function(a, b){
        return parseInt(a) > parseInt(b)
      })
      ports = [exposedPorts[0].toString()]
    }

    this.setState({
      image: image,
      exposedPorts: exposedPorts,
      ports: ports
    })
  },
  onChangePort: function(e) {
    var options = e.target.options;
    var value = [];
    for (var i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }

    this.setState({
      ports: value
    })
  },
  onSubmit: function(e) {
    e.preventDefault()
    var self = this
    if(!this.state.name) {
      this.setState({
        status: 'You have to put in a name'
      })
      return false
    }
    if(!this.state.image) {
      this.setState({
        status: 'You have to choose a image'
      })
      return false
    }
    if(this.state.image && (this.state.exposedPorts.length == 0)) {
      this.setState({
        status: 'There are no ports to expose'
      })
      return false
    }
    if(!this.state.ports || (this.state.ports.length === 0)) {
      this.setState({
        status: 'You have to choose a port to expose'
      })
      return false
    }
    this.setState({
      loading: true
    })
    AppActions.new(this.state)
      .then(function(newApp) {
        self.replaceWith('/apps/' + newApp._id)
      })
      .catch(function(error) {
        self.setState({
          status: error.message
        })
      })
  },
  render: function() {
    var self = this
    return (
      <form className="App" onSubmit={this.onSubmit}>
        <h1>Create app</h1>
        <Label>Name</Label>
        <Input type="text" value={this.state.name} onChange={this.onChangeName} />
        <Label>Image</Label>
        <ImagesSelect images={this.state.images} value={this.state.image} onChange={this.onChangeImage}/>
        <Label>Port</Label>
        {(this.state.exposedPorts.length > 0) &&
        <Select value={this.state.ports} onChange={this.onChangePort}>
          {this.state.exposedPorts.map(function(port) {
            return <option value={port}>{port}</option>
          })}
        </Select>}
        {!this.state.image && <span>Please select an image</span>}
        {this.state.image && (this.state.exposedPorts.length == 0) && <span>There are no ports to expose.</span>}
        <ErrorMessage>{this.state.status}</ErrorMessage>
        <div>
          <Button>Create app</Button>
        </div>
      </form>
    );
  }
})

module.exports = AppCreate
