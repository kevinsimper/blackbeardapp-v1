var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID
var config = require('../config')
var mongoose = require('mongoose')
var PreUsers = require('../models/PreUsers')
var Support = require('../models/Support')

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
      reply({
        status: 'Error'
      }).code(500)
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
    if(result === null) {
      insertEmail()
    } else {
      reply({
        status: 'Already signed up'
      })
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
        reply('error').code(500)
      } else {
        reply({
          status: 'You successful signup to the waiting list'
        })
      }
    })
  }
      
};