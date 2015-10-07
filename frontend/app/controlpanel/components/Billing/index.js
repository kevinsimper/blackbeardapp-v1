var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')
var ContainerItem = require('../ContainerItem/')
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')

var store = require('./store')
var actions = require('./actions')

module.exports = React.createClass({
  mixins: [Navigation],
  getState: function() {
    if (!this.props.params.month) {
      this.props.params.month = moment().format("YYYY-MM")
    }
    return {
      billing: store.getOne(this.props.params.month)
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    actions.loadOne(this.props.params.month)
      .then(function() {
        self.setState({
          loaded: true
        })
      })
    this.unsubscribe = store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    var self = this

    return (
      <div>
        <Header>
          <h2>Billing for {this.props.params.month}</h2>
        </Header>
        <ContentBlock>
          <Table>
            <thead>
              <tr>
                <th>App</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {this.state.billing.apps.map(function(app) {
                return (
                  <tr>
                    <td>{app.appName}</td>
                    <td>{app.hours}</td>
                  </tr>
                )
              })}
              <tr />
              <tr>
                <th>Total</th>
                <th>{this.state.billing.total}</th>
              </tr>
            </tbody>
          </Table>
        </ContentBlock>
      </div>
    );
  }
})
