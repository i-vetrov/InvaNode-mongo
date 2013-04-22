/**
 * @license InvaNode CMS v0.1.4
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

function putIntoCache(fullPath, fileSize) {
  try {
    if(cacheStaticStorage[fullPath.replaceAll(__dirname, '')] !== undefined
        || (cacheStaticStorage.length < options.cache.stat.cacheVolume
        && (parseInt(cacheSize) + parseInt(fileSize)) < (options.cache.stat.cacheSize*1024))) {
      cacheStaticStorage[fullPath.replaceAll(__dirname, '')] = fs.readFileSync(fullPath);
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

var forceClearDynamic = function() {
  for (c in cacheDynamicStorage) {
    if(cacheDynamicStorage.hasOwnProperty(c)){
      cacheDynamicStorage[c] = undefined;
      delete cacheDynamicStorage[c];
    }
  }
}

var forceUpdateStatic = function(){
  doCache(path.join(__dirname, 'template/assets'));
  doCache(path.join(__dirname, 'favicon.ico'));
  options.cache.stat.cachePath.forEach(function(relPath){
    doCache(path.join(__dirname, relPath));
  });
}  
forceUpdateStatic();

var getDynamicCache = function(key, stepFoo) {
  stepFoo(cacheDynamicStorage[key]);
}
exports.getDynamicCache= getDynamicCache;

var setDynamicCache = function(key, data) {
  cacheDynamicStorage[key] = data;
}
exports.setDynamicCache = setDynamicCache;

exports.forceUpdateStatic = forceUpdateStatic;
exports.forceClearDynamic = forceClearDynamic;
exports.cacheStatic = cacheStaticStorage;
exports.cacheDynamic = cacheDynamicStorage;