var React = require('react')
var request = require('superagent')
var config = require('../../config')
var Table = require('../Table/')
var TimeSince = require('../TimeSince/')
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')

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
        <Header>
          <h1>Registry</h1>
        </Header>
        <ContentBlock>
          <Table variant='striped'>
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Tags</th>
                <th>Time Since</th>
                <th>SHA</th>
              </tr>
            </thead>
            <tbody>
              {this.state.images.map(function (image, index) {
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{image.name}</td>
                    {image.tags.map(function (tag) {
                      return (
                        <div>
                          <td>:{tag.tag}</td>
                          <td>
                            <TimeSince timestamp={Date.parse(tag.history[0].v1Compatibility.created) / 1000} />
                          </td>
                          <td>{tag.history[0].v1Compatibility.id.substring(0, 12)}</td>
                        </div>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </ContentBlock>
      </div>
    )
  }
})

module.exports = Registry
