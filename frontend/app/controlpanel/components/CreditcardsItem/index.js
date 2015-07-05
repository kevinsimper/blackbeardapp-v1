var React = require('react')
var Button = require('../Button/')
var CreditcardsActions = require('../Creditcards/actions')

var CreditcardsItem = React.createClass({
  onClickDelete: function() {
    CreditcardsActions.del(this.props.item.name)
  },
  render: function() {
    return (
      <div className="CreditcardsItem">
        {this.props.item.name}
        <div>{this.props.item.creditcard}</div>
        <div>
          <Button onClick={this.onClickDelete}>Delete</Button>
        </div>
      </div>
    )
  }
})

module.exports = CreditcardsItem
