var React = require('react')
var Reflux = require('reflux')
var actions = require('./actions')
var store = require('./store')
var Table = require('../Table/')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation

var Clusters = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
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
  onClickView: function(item) {
    this.transitionTo('/clusters/' + item._id)
  },
  render: function () {
    var self = this
    return (
      <div className='Clusters'>
        <h1>Clusters</h1>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>Type</th>
              <th>Machines</th>
              <th>Container Limit %</th>
              <th>Deleted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.clusters.map(function (item) {
              var handler = self.onClickView.bind(null, item)
              return (
                <tr>
                  <td>{item.type}</td>
                  <td>{item.machines}</td>
                  <td>{Math.round(item.pressure*100) || '-'}</td>
                  <td>{item.deleted && 'Yes'}</td>
                  <td>
                    <Button size='small' onClick={handler}>View</Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    )
  }
})
//
module.exports = Clusters
