var React = require('react')

var Show = React.createClass({
  render: function() {
    return (
      <div>
        <h1>App {this.props.params.id}</h1>
      </div>
    );
  }
})

module.exports = Show