var React = require('react')
var Reflux = require('reflux')
var extend = require('lodash/object/extend')
var request = require('superagent')
var moment = require('moment')
var config = require('../../config')
var VoucherActions = require('../Vouchers/actions')
var VoucherStore = require('../Vouchers/store')
var Input = require('../Input')
var Button = require('../Button')
var Navigation = require('react-router').Navigation

var VoucherClaim = React.createClass({
  mixins: [Navigation],
  getState: function () {
    return {
      voucher: '',
      message: ''
    }
  },
  getInitialState: function () {
    return extend(this.getState(), {
      loading: false
    })
  },
  onClickRequest: function() {
    console.log('On click request')

    var self = this
    this.setState({
      loading: true
    })
    request.post(config.BACKEND_HOST + '/users/me/vouchers')
    .send({
      code: this.state.voucher
    })
    .end(function(err, res) {
      //  message: res.body.message
      console.log(res)

      self.setState({
        loading: false
      })
    })
  },
  handleVoucher: function(e) {
    console.log('Handle Voucher')
    this.setState({
      voucher: e.target.value
    })
  },
  onChange: function () {
    this.setState(this.getState())
  },
  render: function () {
    var self = this
    if(this.state.loading) {
      return <div><h1>Claim a Voucher</h1>Loading...</div>
    }

    return (
      <div className='VoucherClaim'>
        <h1>Claim a Voucher</h1>
        <Input type='voucher' placeholder='Voucher' value={this.state.email} onChange={this.handleVoucher}/>
        <div>
          <Button onClick={this.onClickRequest}>Claim</Button>
        </div>
      </div>
    )
  }
})

module.exports = VoucherClaim
