var React = require('react')
var Reflux = require('reflux')
var actions = require('./actions')
var store = require('./store')
var Table = require('../Table/')

var Clusters = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getState: function () {
    return {
      clusters: store.getAll()
    }
  },
  getInitialState: function () {
    return this.getState()
  },
  componentWillMount: function () {
    actions.load()
    this.listenTo(store, this.onChange)
  },
  onChange: function () {
    this.setState(this.getState())
  },
  render: function () {
    return (
      <div className='Clusters'>
        <h1>Clusters</h1>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Type</th>
              <th>Machines</th>
            </tr>
          </thead>
          <tbody>
            {this.state.clusters.map(function (item) {
              return (
                <tr>
                  <td>{item.type}</td>
                  <td>{item.machines}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    )
  }
})

module.exports = Clusters
