var React = require('react')
var Button = require('../Button/')
var Label = require('../Label/')
var Input = require('../Input/')
var Actions = require('../../Routes/App/Actions')
var Navigation = require('react-router').Navigation

var ContainerFormular = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      region: ''
    }
  },
  handleRegionChange: function(e) {
    this.setState({
      region: e.target.value
    })
  },
  onSubmit: function(e) {
    var self = this
    e.preventDefault()
    Actions.newContainer(this.props.params.id, this.state)
      .then(function() {
        self.transitionTo('/apps/' + self.props.params.id)
      })
  },
  render: function() {
    return (
      <form className='ContainerFormular' onSubmit={this.onSubmit}>
        <h1>Start new containers</h1>
        <Label>Region</Label>
        <Input value={this.state.region} onChange={this.handleRegionChange}/>
        <div>
          <Button>Start</Button>
        </div>
      </form>
    )
  }
})

module.exports = ContainerFormular
