var React = require('react')
var actions = require('./actions')
var store = require('./store')
var moment = require('moment')
var Table = require('../Table/')
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')

var Images = React.createClass({
  getInitialState: function() {
    return this.getState()
  },
  getState: function() {
    return {
      images: store.getImages()
    }
  },
  componentDidMount: function() {
    actions.load()
    this.unsubscribe = store.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChange: function() {
    this.setState(this.getState())
  },
  render: function() {
    return (
      <div className='Images'>
        <Header>
          <h1>Images</h1>
        </Header>
        <ContentBlock>
          <Table variant='striped'>
            <thead>
              <tr>
                <th>Image</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {this.state.images.map(function(image) {
                return (
                  <tr>
                    <td>{image.name}</td>
                    <td>
                      <span title={moment.unix(image.createdAt).format()}>
                        {moment.unix(image.createdAt).fromNow()}
                      </span>
                    </td>
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

module.exports = Images
