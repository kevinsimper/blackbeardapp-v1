var React = require('react')
var Button = require('../Button/')
var Label = require('../Label/')
var Input = require('../Input/')
var Actions = require('../../Routes/App/Actions')
var Navigation = require('react-router').Navigation

var ContainerFormular = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return ProfileStore.getProfile()
  },
  getInitialState: function() {
    return extend(this.getState(), {
      region: ''
    })
  },
  componentDidMount: function() {
    ProfileActions.load()
    this.unsubscribe = ProfileStore.listen(this.onChange)
  },
  onChange: function() {
    this.setState(this.getState())
  },
  handleRegionChange: function(e) {
    this.setState({
      region: e.target.value
    })
  },
  onSubmit: function(e) {
    e.preventDefault()
    var self = this
    this.setState({
      loading: true
    })
    ContainerActions.update(this.state)
      .then(function() {
        self.setState({
          loading: false,
          message: 'Updated'
        })
      })
  },
  render: function() {
    return (
      <form className='ContainerFormular' onSubmit={this.onSubmit}>
        <h1>Start new containers</h1>
        <Label>Region</Label>
        <Input value={this.state.region} onChange={this.handleRegionChange}/>
        List of images here
        <div>
          <Button>Start</Button>
        </div>
      </form>
    )
  }
})

module.exports = ContainerFormular

/*

 onNewContainer: function(id, container) {
 request
 .post(config.BACKEND_HOST + '/users/me/apps/' + id + '/containers')
 .set('Authorization', localStorage.token)
 .send({
 region: container.region
 })
 .end(function(err, res) {
 if(err) {
 return actions.newContainer.failed(err)
 }
 actions.newContainer.completed(id, res.body)
 })
 },
 onNewContainerCompleted: function(id, container) {
 var app = this.getOneApp(id)
 if(app.containers) {
 app.containers.push(container)
 } else {
 app.containers = [container]
 }
 this.trigger(container)
 },

 */
