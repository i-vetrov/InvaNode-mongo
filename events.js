/**
 * @license InvaNode CMS v0.1.5
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

// InvaNode global events

var events = require('events');
var Events = function(){};
Events.prototype = new events.EventEmitter;
var emitter = new Events();

function forceClearCache() {
  process.send({event:'eventCacheClear'});
}

emitter.on('reloadTemplate', function(data){
  process.send({event:'eventTemplateReload',data:{alias:data.alias}});
  forceClearCache();
});
emitter.on('dbDataDelete', function(data){
  forceClearCache();
});
emitter.on('dbDataEdit', function(data){
  forceClearCache();
});
emitter.on('dbNewData', function(data){
  forceClearCache();
});
emitter.on('pluginEdit', function(data){
  process.send({event:'eventPluginEdit'});
  forceClearCache();
});
emitter.on('resetIndex', function(data){
  forceClearCache();
});

exports.emit = function(event, data, stepFoo){
  emitter.emit(event, data);
  if(typeof stepFoo == "function"){
    stepFoo();
  }
};