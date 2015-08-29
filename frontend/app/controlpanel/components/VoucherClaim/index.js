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
      loading: false,
      result: ''
    })
  },
  onClickRequest: function() {
    var self = this
    this.setState({
      loading: true
    })

    VoucherActions.claim(this.state.voucher)
      .then(function(voucher) {
        self.setState({
          loading: false,
          result: voucher.status
        })

        if (voucher.status == 'OK') {
          // Re-render previous payments table

        }
      })
  },
  handleVoucher: function(e) {
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

    var result = ''
    if (this.state.result) {
      if (this.state.result == 'OK') {
        result = <div style={{color: 'green'}}>Voucher successfully claimed!</div>
      } else {
        result = <div style={{color: 'red'}}>The voucher you entered is invalid.</div>
      }
    }

    return (
      <div className='VoucherClaim'>
        <h1>Claim a Voucher</h1>
        <Input type='voucher' placeholder='Voucher' value={this.state.email} onChange={this.handleVoucher}/>
        <div>
          <Button onClick={this.onClickRequest.bind(this)}>Claim</Button>
        </div>
        {result}
      </div>
    )
  }
})

module.exports = VoucherClaim
