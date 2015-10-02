var React = require('react')
var extend = require('lodash/object/extend')
var moment = require('moment')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var StatusIcon = require('../StatusIcon/')
var Table = require('../Table/')
var ContainerItem = require('../ContainerItem/')
var filter = require('lodash/collection/filter')
var Router = require('react-router')
var Link = Router.Link
var _ = require('lodash')

var store = require('./store')
var actions = require('./actions')

var Usage = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {
      billing: store.getBilling()
    }
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentDidMount: function() {
    var self = this
    actions.loadOne()
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
        <h2>Usage</h2>
        <Table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Application</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
          {Object.keys(this.state.billing.monthTotals).map(function(key) {
            var rows = []
            self.state.billing.results.map(function (billing) {
              if (billing.month === key) {
                rows.push(<tr>
                  <td>{billing.month}</td>
                  <td>
                    <Link to={'/controlpanel/apps/' + billing.app._id}>
                      {billing.app.name}
                    </Link>
                  </td>
                  <td>{billing.hours}</td>
                </tr>)
              }
            })

            rows.push(<tr>
              <td></td>
              <td></td>
              <td style={{fontWeight: "bold"}}>{self.state.billing.monthTotals[key]}</td>
            </tr>)

            return rows;
          })}
          </tbody>
        </Table>
      </div>
    );
  }
})

module.exports = Usage
