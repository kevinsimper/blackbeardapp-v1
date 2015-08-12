var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var config = require('../config')
var mongoose = require('mongoose')
var PreUsers = require('../models/PreUsers')
var Support = require('../models/Support')
var Boom = require('boom')

exports.postContact = function(request, reply) {
  var name = request.payload.name;
  var email = request.payload.email;
  var message = request.payload.message;
  var newSupport = new Support({
    name: name,
    email: email,
    message: message,
    timestamp: Math.round(Date.now() / 1000),
    ip: request.info.remoteAddress
  })

  newSupport.save(function(err, result) {
    if (err) {
      request.log(['mongo'], err)
      return reply(Boom.badImplementation())
    }
    reply({
      status: 'OK'
    })
  });
}

exports.postSignup = function(request, reply) {
  var email = request.payload.email;

  PreUsers.findOne({
    email: email
  }, function(err, result) {
    if(err) {
      request.log(['mongo'], err)
      reply(Boom.badImplementation())
    }

    if(result === null) {
      insertEmail()
    } else {
      reply(Boom.badRequest({
        status: 'Already signed up'
      }))
    }
  })

  function insertEmail() {
    var newPreUser = new PreUsers({
      email: email,
      active: false,
      timestamp: Math.round(Date.now() / 1000),
      ip: request.info.remoteAddress
    })
    newPreUser.save(function(err, result) {
      if (err) {
        request.log(['mongo'], err)
        return reply(Boom.badImplementation())
      }
      reply({
        status: 'You have successfully signed up for the waiting list.'
      })
    })
  }
}

exports.getQueue = function(request, reply) {
  PreUsers.findOne({
    email: request.payload.email
  }, function(err, preuser) {
    PreUsers.where({timestamp: {$lt: preuser.timestamp}, active: false}).count(function(err, result) {
      reply({
        number: result + 1
      })
    })  
  })
}
