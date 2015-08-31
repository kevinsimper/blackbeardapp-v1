var React = require('react')
var extend = require('lodash/object/extend')
var VoucherActions = require('../Vouchers/actions')
var VoucherStore = require('../Vouchers/store')
var Navigation = require('react-router').Navigation;
var Input = require('../Input/')
var Label= require('../Label/')
var TextArea= require('../TextArea/')
var Button = require('../Button/')
var ErrorMessage = require('../ErrorMessage/')

var VoucherCreate = React.createClass({
  mixins: [Navigation],
  getState: function() {
    return {}
  },
  getInitialState: function() {
    return extend(this.getState(), {
      loaded: false,
      amount: '',
      note: '',
      limit: '1',
      email: '',
      unlimited: false,
      code: '',
      autoCode: true
    })
  },
  onChange: function() {
    this.setState(this.getState())
  },
  componentDidMount: function() {
    VoucherActions.load()
    this.unsubscribe = VoucherStore.listen(this.onChange)
  },
  componentWillUnmount: function() {
    this.unsubscribe()
  },
  onChangeAmount: function(e) {
    this.setState({
      amount: e.target.value
    })
  },
  onChangeNote: function(e) {
    this.setState({
      note: e.target.value
    })
  },
  onChangeLimit: function(e) {
    this.setState({
      limit: e.target.value
    })
  },
  onChangeLimitMode: function(e) {
    this.setState({
      unlimited: !this.state.unlimited
    })
  },
  onChangeEmail: function(e) {
    this.setState({
      email: e.target.value
    })
  },
  onChangeCode: function(e) {
    this.setState({
      code: e.target.value
    })
  },
  onChangeAutoCode: function(e) {
    this.setState({
      autoCode: !this.state.autoCode
    })
  },
  onSubmit: function(e) {
    e.preventDefault()
    var self = this

    if (!this.state.unlimited) {
      if (this.state.limit === "") {
        this.setState({
          status: 'You must input a limit value'
        })
        return false
      }
    } else {
      this.state.limit = null
    }

    if (!this.state.autoCode) {
      if (this.state.code === "") {
        this.setState({
          status: 'You must input a custom code'
        })
        return false
      }
    } else {
      this.state.code = null
    }

    if(!this.state.amount) {
      this.setState({
        status: 'You have to put in an amount'
      })
      return false
    } else {
      this.state.amount = this.state.amount*100
    }

    this.setState({
      loading: true
    })

    VoucherActions.new(this.state)
      .then(function(voucher) {
        self.transitionTo('/vouchers/' + voucher._id)
      })
  },
  render: function() {
    return (
      <form className="Voucher" onSubmit={this.onSubmit}>
        <h1>Create Voucher</h1>
        <Label>Code*</Label>
        <div>
          <span>Automatically generated </span>
          <input type="checkbox" name="autoCode" checked={this.state.autoCode} onChange={this.onChangeAutoCode}/>
        </div>
        {!this.state.autoCode &&
        <div>
         <span>Custom code </span>
         <Input type="text" value={this.state.code} onChange={this.onChangeCode} />
        </div>
        }
        <Label>Amount*</Label>
        <Input type="text" value={this.state.amount} onChange={this.onChangeAmount} />
        <Label>Usage</Label>
        <div>
          <span>Unlimited </span>
          <input type="checkbox" name="limited" checked={this.state.unlimited} onChange={this.onChangeLimitMode}/>
        </div>
        {!this.state.unlimited &&
        <div>
         <span>Limited </span>
         <Input type="text" style={{width: "4em"}} value={this.state.limit} onChange={this.onChangeLimit} disabled=""/>
        </div>
        }
        <Label>Email</Label>
        <Input type="text" value={this.state.email} onChange={this.onChangeEmail} />
        <Label>Note</Label>
        <TextArea type="text" value={this.state.note} onChange={this.onChangeNote} />
        <div>
          <Button>Create Voucher</Button>
        </div>
        <ErrorMessage>{this.state.status}</ErrorMessage>
      </form>
    );
  }
})

module.exports = VoucherCreate
