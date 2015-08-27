var React = require('react')
var request = require('superagent')
var config = require('../../config')
var Table = require('../Table')
var Snippet = require('../Snippet')

var ClusterContainers = React.createClass({
  getInitialState: function () {
    return {
      containers: []
    }
  },
  componentDidMount: function () {
    var self = this
    request.get(config.BACKEND_HOST + '/clusters/' + this.props.cluster + '/containers')
      .set('Authorization', localStorage.token)
      .end(function (err, res) {
        self.setState({
          containers: res.body
        })
      })
  },
  render: function () {
    return (
      <div className='ClusterContainers'>
        <h2>Containers</h2>
        <Table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Command</th>
              <th>Created</th>
              <th>Status</th>
              <th>Ports</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {this.state.containers.map(function (item) {
              return (
                <tr>
                  <td>{item.Image}</td>
                  <td>{item.Command}</td>
                  <td>{item.Created}</td>
                  <td>{item.Status}</td>
                  <td>
                    {item.Ports.map(function (port) {
                      console.log(port)
                      return <div>{port.IP}:{port.PublicPort}-&gt;{port.PrivatePort}, </div>
                    })}
                  </td>
                  <td>{item.Names[0]}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
        <pre>
          <Snippet>
            {JSON.stringify(this.state.containers, null, 2)}
          </Snippet>
        </pre>
      </div>
    )
  }
})

module.exports = ClusterContainers
