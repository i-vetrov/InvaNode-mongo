/**
 * @license InvaNode CMS v0.1.5
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

//InvaNode caching

var fs = require("fs");
var path = require('path');
var options = require("./options");
var events = require("./events");
var cacheStaticStorage = {};
var cacheSize = 0;
var cacheDynamicStorage = {};
var __wwwdir = path.join(__dirname, 'www');


var iskvs_client = require('iskvs').Client(options.iskvsOpt.path);

String.prototype.replaceAll=function(find, replace_to) {
  return this.replace(new RegExp(find, "g"), replace_to);
}

function cacheDirectory(dirPath) {
    try {
      var list = fs.readdirSync(dirPath);
      list.forEach(function(file){
      var fullPath = path.join(dirPath, file);
      var stats = fs.statSync(fullPath);
        if(stats.isFile()){
          putIntoCache(fullPath, stats.size);
        }  
        else if(stats.isDirectory()){
          cacheDirectory(fullPath);
        }
      });
    }
    catch(e) {
      console.log("caching dir error: " + e);
    }
}

function doCache(fullPath) {
  if(options.cache.stat.cacheOn) {
    try {
      var stats = fs.statSync(fullPath);
      if(stats.isFile()){
        putIntoCache(fullPath, stats.size);
      }
      else if(stats.isDirectory()) {
        cacheDirectory(fullPath);
      }
    }
    catch(e) {
      console.log("caching file error: " + e);
    }
  }
}

function countStaticCacheEntriesNum() {
  var count = 0;
  for (var k in cacheStaticStorage) {
    if (cacheStaticStorage.hasOwnProperty(k)) {
       ++count;
    }
  }
  return count;
}

function putIntoCache(fullPath, fileSize) {
   try {
    if(cacheStaticStorage[fullPath.replaceAll(__wwwdir, '')] !== undefined
        || (countStaticCacheEntriesNum() < options.cache.stat.cacheVolume
        && (parseInt(cacheSize) + parseInt(fileSize)) < (options.cache.stat.cacheSize*1024))) {
      cacheStaticStorage[fullPath.replaceAll(__wwwdir, '')] = fs.readFileSync(fullPath);
      cacheSize += fileSize;
      if(options.cache.stat.watchFiles) {
        fs.watch(fullPath, function(e, f){
            if(e == 'change') {
              putIntoCache(fullPath, 0);
            }
        });
      }
    }
  }
  catch(e) {
    console.log("putting into cache error: " + e);
  }
}

var forceUpdateStatic = function(){
  doCache(path.join(__wwwdir, 'template/assets'));
  doCache(path.join(__wwwdir, 'favicon.ico'));
  options.cache.stat.cachePath.forEach(function(relPath){
    doCache(path.join(__wwwdir, relPath));
  });
}  
forceUpdateStatic();

var forceClearDynamic = function() {
  iskvs_client.clr(function(err, data) {
  });
}

var getDynamicCache = function(key, stepFoo) {
  if(options.cache.dynamic.cacheOn) {
    iskvs_client.get(key, function(err, data) {
      stepFoo(data);
    });
  }
  else {
    stepFoo(null);
  }
}
exports.getDynamicCache = getDynamicCache;

var setDynamicCache = function(key, value) {
  if(options.cache.dynamic.cacheOn) {
    iskvs_client.set(key, value, function(err, data) {
      if(err) {
        console.log(err);
      }
    });
  }
}
exports.setDynamicCache = setDynamicCache;

exports.forceUpdateStatic = forceUpdateStatic;
exports.forceClearDynamic = forceClearDynamic;
exports.cacheStatic = cacheStaticStorage;
exports.cacheDynamic = cacheDynamicStorage;