var React = require('react')
var moment = require('moment')
var Hint = require('../Hint')

var TimeSince = React.createClass({
  render: function () {
    return (
      <span className='TimeSince'>
        <Hint message={moment.unix(this.props.timestamp).format()}>
          {moment.unix(this.props.timestamp).fromNow()}
        </Hint>
      </span>
    )
  }
})

module.exports = TimeSince
