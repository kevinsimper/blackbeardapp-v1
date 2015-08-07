var React = require('react')
var Actions = require('./actions')
var Store = require('./store')
var CreditcardsItem = require('../CreditcardsItem/')

var Creditcards = React.createClass({
  getInitialState: function() {
    return this.getState()
  },
  getState: function() {
    return {
      creditCards: Store.getCreditCards()
    }
  },
  componentDidMount: function() {
    Actions.load()
    this.unsubscribe = Store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    return (
      <div className='Creditcards'>
        <h2>Credit Cards</h2>
        {this.state.creditCards.map(function(item) {
          return <CreditcardsItem item={item}/>
        })}
      </div>
    )
  }
})

module.exports = Creditcards
