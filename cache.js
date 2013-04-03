/**
 * @license InvaNode CMS v0.1.2
 * https://github.com/i-vetrov/InvaNode
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

//InvaNode caching

var fs = require("fs");
var cacheUpInt = 60000;
var cacheStaticStorage = [];
var whatchFile = [];


String.prototype.replaceAll=function(find, replace_to){
  return this.replace(new RegExp(find, "g"), replace_to);
};

function cacheDirectory(path){
  var list = fs.readdirSync(path);
  list.forEach(function(file){
  var fullPath = path + '/' + file;
  var stats = fs.statSync(fullPath);
    if(stats.isFile()){
      cacheStaticStorage[fullPath.replaceAll(__dirname, '')] = fs.readFileSync(fullPath);
      whatchFile[fullPath.replaceAll(__dirname, '')] = stats.mtime.getTime();
    }  
    else if(stats.isDirectory()){
      cacheDirectory(fullPath)
    }
});
}

function cacheFile(fullPath){
  var stats = fs.statSync(fullPath);
  if(stats.isFile()){
    cacheStaticStorage[fullPath.replaceAll(__dirname, '')] = fs.readFileSync(fullPath);
    whatchFile[fullPath.replaceAll(__dirname, '')] = stats.mtime.getTime();
  }
}

function fileCheck(path, mtime)
{
  fs.stat(__dirname + path, function(error, stats){   
    if(!error){
      if(mtime != stats.mtime.getTime()){
        console.log("file updates")
        fs.readFile(__dirname + path, function(error, data){
          if(!error){
            cacheStaticStorage[path] = data;
            whatchFile[path] = stats.mtime.getTime();
          }
        });
      }    
    }
    else{
      cacheStaticStorage[path] = undefined;
      whatchFile[path] = undefined;
    }
  }); 
}

setInterval(function(){
  for (var path in whatchFile) {
    fileCheck(path, whatchFile[path]);
  }
}, cacheUpInt);

exports.forceUpdate = function(){
  cacheDirectory(__dirname + '/template/assets');
  cacheFile(__dirname + '/favicon.ico')
}  

exports.cacheStatic = cacheStaticStorage;

cacheDirectory(__dirname + '/template/assets');
cacheFile(__dirname + '/favicon.ico')