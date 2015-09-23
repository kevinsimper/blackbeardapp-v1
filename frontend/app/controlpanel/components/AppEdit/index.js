var React = require('react')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Table = require('../Table')
var Button = require('../Button')

var AppEdit = React.createClass({
  getInitialState: function () {
    return {
      app: {},
      variables: [{
        key: 'NODE_ENV',
        value: 'production'
      }],
      key: '',
      value: ''
    }
  },
  onKeyChange: function (e) {
    this.setState({
      key: e.target.value
    })
  },
  onValueChange: function (e) {
    this.setState({
      value: e.target.value
    })
  },
  onClickAdd: function () {
    this.setState({
      variables: this.state.variables.concat([{key: this.state.key, value: this.state.value}]),
      key: '',
      value: ''
    })
  },
  onClickDelete: function (variable) {
    this.setState({
      variables: this.state.variables.filter(function (item) {
        return item.key !== variable.key
      })
    })
  },
  render: function () {
    var self = this
    return (
      <div className='AppEdit'>
        <h2>Edit app</h2>
        <Table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.state.variables.map(function (variable) {
              return (
                <tr className='AppEdit__Variable' key={variable.key}>
                  <td className='AppEdit__Variable__Key'>
                    {variable.key}
                  </td>
                  <td className='AppEdit__Variable__Value'>
                    <Input type='text' value={variable.value} />
                  </td>
                  <td>
                    <Button variant='danger' size='small' onClick={self.onClickDelete.bind(null, variable)}>Delete</Button>
                  </td>
                </tr>
              )
            })}
            <tr>
              <td>
                <Input type='text' value={this.state.key} onChange={this.onKeyChange}/>
              </td>
              <td>
                <Input type='text' value={this.state.value} onChange={this.onValueChange} />
              </td>
              <td>
                <Button size='small' onClick={this.onClickAdd}>Add</Button>
              </td>
            </tr>
          </tbody>
        </Table>

      </div>
    )
  }
})

module.exports = AppEdit
