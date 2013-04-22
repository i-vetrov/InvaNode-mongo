/**
 * @license InvaNode CMS v0.1.4
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

//InvaNode core app

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log("InvaNode started")
  function masterMessageHandler(message) {
    if(message.event) {
      var order = {
        order:''
      }
      switch(message.event) {
        case "eventTemplateReload":
          order.order = "orderReloadTemplate";
          order.data = {alias:message.data.alias};
          break;
        case "eventCacheClear":
          order.order = "orderClearCache";
          break;
      }
      Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].send(order);
      });
    }
  }
  cluster.on('online', function(worker, code, signal) {
    worker.on('message', masterMessageHandler);
  });
  cluster.on('exit', function(worker, code, signal) {
    cluster.fork();
    console.log('InvaNode worker ' + worker.process.pid + ' died. New forked.');
  });
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
else if(cluster.isWorker) {
  var cache = require("./cache");
  var template = require("./templates").template;
  var server = require('./server');
  function workerMessageHandler(message) {
    if(message.order) {
      switch(message.order) {
        case "orderReloadTemplate":
          template[message.data.alias].initTemplate(message.data.alias, function(dummy){});
          break;
        case "orderClearCache":
          cache.forceClearDynamic();
          break;
      }
    }
  }
  process.on('message', workerMessageHandler);
  server.create();
}


