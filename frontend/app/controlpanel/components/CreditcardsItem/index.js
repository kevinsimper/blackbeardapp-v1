var React = require('react')
var Button = require('../Button/')
var CreditcardsActions = require('../Creditcards/actions')

var CreditcardsItem = React.createClass({
  onClickDelete: function() {
    CreditcardsActions.del(this.props.item.name)
  },
  onClickActivate: function() {
    CreditcardsActions.activate(this.props.item._id)
  },
  render: function() {
    return (
      <div className="CreditcardsItem">
        <div>{this.props.item.active ?
          <strong>{this.props.item.name}*</strong>
          :
          this.props.item.name
        }
        </div>
        <div>
          <Button onClick={this.onClickDelete}>Delete</Button>
          {!this.props.item.active ?
            <span>
              &nbsp;
              <Button onClick={this.onClickActivate}>Activate</Button>
            </span>
            :
            <span></span>
          }
        </div>
      </div>
    )
  }
})

module.exports = CreditcardsItem
