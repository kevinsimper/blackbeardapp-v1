var React = require('react')

var Button = require('../Button/')
var Label = require('../Label/')
var Input = require('../Input/')
var Navigation = require('react-router').Navigation
var AppActions = require('../Apps/actions')

var ContainerFormular = React.createClass({
  mixins: [Navigation],
  getInitialState: function() {
    return {
      amount: '1'
    }
  },
  handleAmountChange: function(e) {
    this.setState({
      amount: '1'
    })
  },
  onSubmit: function(e) {
    var self = this
    e.preventDefault()
    AppActions.newContainer(this.props.params.id, this.state)
      .then(function() {
        self.transitionTo('/apps/' + self.props.params.id)
      })
  },
  render: function() {
    return (
      <form className='ContainerFormular' onSubmit={this.onSubmit}>
        <h1>Start new containers</h1>
        <Label>Amount of new containers</Label>
        <Input type='number' min='1' max='1' value={this.state.amount} onChange={this.handleAmountChange}/>
        <div>
          <small>Right now it is only possible to start a single container.</small>
        </div>
        <div>
          <Button>Start</Button>
        </div>
      </form>
    )
  }
})

module.exports = ContainerFormular
