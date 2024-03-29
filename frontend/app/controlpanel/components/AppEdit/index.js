var React = require('react')
var extend = require('lodash/object/extend')
var Input = require('../Input')
var Table = require('../Table')
var Button = require('../Button')
var request = require('superagent')
var config = require('../../config')
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')
var ErrorMessage = require('../ErrorMessage/')
var Navigation = require('react-router').Navigation

var AppEdit = React.createClass({
  mixins: [Navigation],
  getInitialState: function () {
    return {
      app: {},
      environments: [],
      key: '',
      value: '',
      status: ''
    }
  },
  componentDidMount: function () {
    var self = this
    request
      .get(config.BACKEND_HOST + '/users/me/apps/' + this.props.params.id)
      .set('Authorization', localStorage.token)
      .end(function(err, res) {
        self.setState({
          app: res.body,
          environments: res.body.environments
        })
      })
  },
  saveEnvironments: function () {
    if (this.state.key != '') {
      alert("You have an unsaved environment variable.")
    } else {
      var self = this
      request
        .patch(config.BACKEND_HOST + '/users/me/apps/' + this.props.params.id)
        .set('Authorization', localStorage.token)
        .send({
          environments: this.state.environments
        })
        .end(function (err, res) {
          self.setState({
            status: 'Environment variables successfully saved.'
          })
        })
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
      environments: this.state.environments.concat([{key: this.state.key, value: this.state.value}]),
      key: '',
      value: ''
    })
  },
  onClickDelete: function (variable) {
    this.setState({
      environments: this.state.environments.filter(function (item) {
        return item.key !== variable.key
      })
    })
  },
  onClickSave: function () {
    this.saveEnvironments()
  },
  onClickBack: function (e) {
    e.preventDefault()
    this.transitionTo("/controlpanel/apps/"+this.props.params.id)
  },
  onExistingValueChange: function (variable, e) {
    var copy = this.state.environments.slice()
    copy.forEach(function (item) {
      if(item.key === variable.key) {
        item.value = e.target.value
      }
    })
    this.setState({
      variables: copy
    })
  },
  render: function () {
    var self = this
    return (
      <div className='AppEdit'>
        <Header>
          <h2>Edit App settings</h2>
        </Header>
        <ContentBlock>
          {this.state.app && <a href="" onClick={this.onClickBack}>&lt; Back to App</a>}
          <h3>Environment Variables</h3>
          <div style={{color: "green", fontWeight: "bold", marginBottom: "0.5em"}}>{this.state.status}</div>
          <div style={{marginBottom: "0.5em"}}>These will be available inside the container as environment variables.</div>
          <Table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.environments.map(function (variable) {
                return (
                  <tr className='AppEdit__Variable' key={variable.key}>
                    <td className='AppEdit__Variable__Key'>
                      {variable.key}
                    </td>
                    <td className='AppEdit__Variable__Value'>
                      <Input type='text' value={variable.value} onChange={self.onExistingValueChange.bind(null, variable)} />
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
          <Button onClick={this.onClickSave}>Save</Button>
        </ContentBlock>
      </div>
    )
  }
})

module.exports = AppEdit
