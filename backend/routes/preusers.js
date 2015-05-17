var MongoClient = require('mongodb').MongoClient
var Boom = require('boom')
var config = require('../config')
var PreUsers = require('../models/PreUsers')

exports.getPreUsers = function(request, reply) {
  PreUsers.find(function(err, preUsers) {
    if(err) {
      return reply(Boom.badImplementation())
    }  
    reply(preUsers)
  })
}

exports.postPreUsers = function(request, reply) {
  var email = request.payload.email
  PreUsers.findOne({email: email}, function(err, preUser) {
    if(preUser) {
      return reply(Boom.badRequest('Email already exists'))
    }
    var newPreUser = new PreUsers({
      email: request.payload.email,
      active: false,
    })

    newPreUser.save(function(err) {
      reply({
        status: 'User created'
      })
    })
  })
}

exports.putPreUsers = function(request, reply) {
  PreUsers.findOne({_id: request.params.id}, function(err, preUser) {
    if(preUser) {
      return reply(Boom.badRequest('User does not exists'))
    }
    preUser.comment = request.payload.comment
    preUser.save(function(err) {
      reply({
        status: 'User updated'
      })
    })
  })
}

exports.delPreUsers = function(request, reply) {
  PreUsers.findByIdAndRemove(request.params.id, function(err, preUser) {
    if(preUser) {
      return reply({
        status: 'User deleted'
      })
    }
    return reply(Boom.badRequest('User does not exists'))
  })
}