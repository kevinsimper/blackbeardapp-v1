var React = require('react')
var Reflux = require('reflux')
var extend = require('lodash/object/extend')
var request = require('superagent')
var moment = require('moment')
var config = require('../../config')
var VoucherActions = require('../Vouchers/actions')
var VoucherStore = require('../Vouchers/store')
var Table = require('../Table')
var Button = require('../Button')
var Navigation = require('react-router').Navigation
var Link = require('react-router').Link
var Header = require('../Header')
var ContentBlock = require('../ContentBlock')

var VoucherShow = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
  getState: function () {
    return {
      voucher: VoucherStore.getOne(this.props.params.id)
    }
  },
  getInitialState: function () {
    return extend(this.getState(), {
      loaded: false
    })
  },
  componentWillMount: function () {
    var self = this
    VoucherActions.load().then(function () {
      self.setState({
        loaded: true
      })
    })
    this.listenTo(VoucherStore, this.onChange)
  },
  onChange: function () {
    this.setState(this.getState())
  },
  render: function () {
    var self = this
    if(!this.state.loaded) {
      return <div>Loading...</div>
    }

    return (
      <div className='VoucherShow'>
        <Header>
          <h1>Vouchers</h1>
          <Link to="/controlpanel/vouchers">&lt; Back to Voucher List</Link>
        </Header>
        <ContentBlock>
          <Table variant='striped'>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Amount</td>
                <td>${this.state.voucher.amount / 100}</td>
              </tr>
              <tr>
                <td>Code</td>
                <td>{this.state.voucher.code}</td>
              </tr>
              <tr>
                <td>Note</td>
                <td>{this.state.voucher.note}</td>
              </tr>
              <tr>
                <td>Email</td>
                <td>{this.state.voucher.email || '-'}</td>
              </tr>
              <tr>
                <td>Created At</td>
                <td>{moment.unix(this.state.voucher.createdAt).format()}</td>
              </tr>
              <tr>
                <td>Used</td>
                <td>{this.state.voucher.used}</td>
              </tr>
              <tr>
                <td>Limit</td>
                <td>{this.state.voucher.limit || '\u221E'}</td>
              </tr>
            </tbody>
          </Table>
        </ContentBlock>
      </div>
    )
  }
})

module.exports = VoucherShow
