var React = require('react')
var Actions = require('./actions')
var Store = require('./store')

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
        <h2>Creditcards</h2>
        {this.state.creditCards.map(function(item) {
          return (
            <div>
              {item.name}
              <div>{item.creditcard}</div>
            </div>
          )
        })}
      </div>
    )
  }
})

module.exports = Creditcards
