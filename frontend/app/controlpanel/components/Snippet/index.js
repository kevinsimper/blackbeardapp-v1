var React = require('react')
var Button = require('../Button')

var Snippet = React.createClass({
  getInitialState: function () {
    return {
      limit: 100,
      button: 'Show more'
    }
  },
  getSnippet: function() {
    if(this.state.limit === 0) {
      return this.props.children
    } else {
      return this.props.children.substring(0, this.state.limit)
    }
  },
  onClickShowMore: function () {
    this.setState({
      limit: (this.state.limit === 100) ? 0 : 100,
      button: (this.state.limit === 100) ? 'Show less' : 'Show more'
    })
  },
  render: function () {
    return (
      <div className='Snippet'>
        {this.getSnippet()}
        <div style={{marginTop: 5}}>
          <Button size='small' onClick={this.onClickShowMore}>{this.state.button}</Button>
        </div>
      </div>
    )
  }
})

module.exports = Snippet
