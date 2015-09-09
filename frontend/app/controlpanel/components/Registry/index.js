var React = require('react')
var request = require('superagent')
var config = require('../../config')
var Table = require('../Table/')

var Registry = React.createClass({
  getInitialState: function () {
    return {
      images: []
    }
  },
  componentDidMount: function () {
    var self = this
    request
      .get(config.BACKEND_HOST + '/registry/images')
      .set('Authorization', localStorage.token)
      .end(function (err, res) {
        self.setState({
          images: res.body
        })
      })
  },
  render: function () {
    return (
      <div className='Registry'>
        <h1>Registry</h1>
        <Table variant='striped'>
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
            </tr>
          </thead>
          <tbody>
            {this.state.images.map(function (image, index) {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{image}</td>
                </tr>
              )
            })}
          </tbody>
        </Table>
      </div>
    )
  }
})

module.exports = Registry
