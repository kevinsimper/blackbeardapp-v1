var React = require('react')
var Input = require('../Input')
var Button = require('../Button')
var Label = require('../Label')

var CreditcardsFormular = React.createClass({
  getInitialState: function() {
    return {
      loading: false
    }
  },
  onSubmit: function(e) {
    e.preventDefault()
    this.setState({
      loading: true
    })
  },
  render: function() {
    return (
      <form className='Payment' onSubmit={this.onSubmit}>
        <h2>Payment</h2>
        <Label>Card Number</Label>
        <Input placeholder='1234-5678-9012-3456'/>
        <Label>CCV</Label>
        <Input/>
        <Label>Expires</Label>
        <Input placeholder='MM/YY'/>
        <div>
          <Button>Create creditcard</Button>
        </div>
        {this.state.loading && <div>Loading ...</div>}
      </form>
    )
  }
})

module.exports = CreditcardsFormular
