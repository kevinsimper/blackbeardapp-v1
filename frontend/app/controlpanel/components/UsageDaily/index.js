var React = require('react')
var request = require('../../Utils/request')
var Reflux = require('reflux')
var AppsActions = require('../Apps/actions')
var AppsStore = require('../Apps/store')
var store = require('./store')
var actions = require('./actions')
var Table = require('../table')
var findWhere = require('lodash/collection/findWhere')

var UsageDaily = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getState: function () {
    return {
      apps: AppsStore.getApps(),
      billings: store.getAll()
    }
  },
  getInitialState: function () {
    return this.getState()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  componentDidMount: function () {
    AppsActions.load().then(function (apps) {
      apps.forEach(function (app) {
        actions.loadOne(app._id)
      })
    })
    this.listenTo(AppsStore, this.onChange)
    this.listenTo(store, this.onChange)
  },
  getHeadings: function () {
    var self = this
    return Object.keys(this.state.billings).map(function (key) {
      var app = findWhere(self.state.apps, {_id: key})
      return app.name
    })
  },
  getAppsBilling: function () {
    var self = this
    var data = Object.keys(this.state.billings).map(function (key) {
      return self.state.billings[key]
    })
    if(data.length === 0) {
      // exit early
      return
    }
    var rows = [];
    for(var i = 0; i < data[0].length; i++) {
      var cells = []
      for(var y = 0; y < data.length; y++) {
        cells.push(<td>{data[y][i].hours}</td>)
      }
      rows.push(
        <tr>
          <td>{data[0][i].day}</td>
          {cells}
        </tr>
      )
    }
    return rows
  },
  render: function () {
    return (
      <div className='UsageDaily'>
        <h2>Daily</h2>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>#</th>
              {this.getHeadings().map(function (appName) {
                return <th>{appName}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {this.getAppsBilling()}
          </tbody>
        </Table>
      </div>
    )
  }
})

module.exports = UsageDaily
