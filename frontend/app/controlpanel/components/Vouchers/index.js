var React = require('react')
var Reflux = require('reflux')
var actions = require('./actions')
var store = require('./store')
var Table = require('../Table/')
var Button = require('../Button/')
var Navigation = require('react-router').Navigation
var moment = require('moment')
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')

var Vouchers = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
  getState: function () {
    return {
      vouchers: store.getAll()
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
  onClickView: function(voucher) {
    this.transitionTo('/controlpanel/vouchers/' + voucher._id)
  },
  onClickNew: function(voucher) {
    this.transitionTo('/controlpanel/vouchers/create')
  },
  render: function () {
    var self = this
    return (
      <div className='Vouchers'>
        <Header>
          <h1>Vouchers</h1>
        </Header>
        <ContentBlock>
          <Button size='small' onClick={self.onClickNew.bind()}>Generate New</Button>
          <Table variant='striped'>
            <thead>
              <tr>
                <th>Code</th>
                <th>Amount</th>
                <th>Email</th>
                <th>Note</th>
                <th>Used</th>
                <th>Limit</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.vouchers.map(function (voucher) {
                return (
                  <tr>
                    <td>{voucher.code}</td>
                    <td>${voucher.amount/100}</td>
                    <td>{voucher.email || '-'}</td>
                    <td>{voucher.note || '-'}</td>
                    <td>{voucher.used}</td>
                    <td>{voucher.limit || '\u221E'}</td>
                    <td>{moment.unix(voucher.createdAt).format()}</td>
                    <td>
                      <Button size='small' onClick={self.onClickView.bind(null, voucher)}>View</Button>
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

module.exports = Vouchers
