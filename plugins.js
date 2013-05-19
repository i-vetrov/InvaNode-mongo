/**
 * @license InvaNode CMS v0.1.5
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

// Plugins engine file

var fs = require("fs");
var message = {error:{message:"error"},done:{message:"done"}};

String.prototype.replaceAll=function(find, replace_to) {
   return this.replace(new RegExp(find, "g"), replace_to);
};

String.prototype.escapeSpecialChars = function() {
  return this.replace(/[\\]/g, '\\\\')
             .replace(/[\"]/g, '\\\"')
             .replace(/[\/]/g, '\\/')
             .replace(/[\b]/g, '\\b')
             .replace(/[\f]/g, '\\f')
             .replace(/[\n]/g, '\\n')
             .replace(/[\r]/g, '\\r')
             .replace(/[\t]/g, '\\t');
};

var Plugins = function() {
 var context = this; 
 var folder = __dirname + "/plugins"; 
 this.plugin = [];
 this.list = fs.readdirSync(folder);
 this.list.forEach(function(name) {
    var i = context.plugin.length;
    context.plugin[i] = 
      JSON.parse(fs.readFileSync(folder + "/" + name + "/plugin.json", 'utf-8'));
    context.plugin[i].applyTo.push('page','post','small_post','footer','header'); 
    context.plugin[i].content.replaceWith = 
      fs.readFileSync(folder + "/" + name + "/" + context.plugin[i].content.source, 'utf-8');
    context.plugin[i].alias = name;
    try {
      context.plugin[i].serveCode = require("./plugins/"+name+"/plugin-server.js");
    }
    catch(e) {
     context.plugin[i].serveCode = "none";
    }
    context.plugin[i].serverExecute = function(_in, inData, response) {
      if(this.serveCode != "none"){
        try {
          this.serveCode.execute(_in, inData, message, function(outData) {
            if(typeof response == "function") {
              response(outData);
            }
            else{
              response.writeHead(200, {"Content-Type": "text/plain"});
              response.end(JSON.stringify(outData));
            }    
          });
        }
        catch(e) {   
          console.log("Server plugin execution error: " + e);
          if(typeof response == "function") {
            response(JSON.stringify(message.error));
          }
          else {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end(JSON.stringify(message.error));
          }
        }
      }
    };
  });
  this.reloadPlugins = function() {
    context.plugin = [];
    context.list = fs.readdirSync(folder);
    context.list.forEach(function(name){
      var i = context.plugin.length;
      context.plugin[i] = 
        JSON.parse(fs.readFileSync(folder + "/" + name + "/plugin.json", 'utf-8'));
      context.plugin[i].content.replaceWith = 
        fs.readFileSync(folder + "/" + name + "/" + context.plugin[i].content.source, 'utf-8');
      context.plugin[i].alias = name;
      try {
        context.plugin[i].serveCode = require("./plugins/"+name+"/plugin-server.js");
      }
      catch(e) {
        context.plugin[i].serveCode = "none";
      }
      context.plugin[i].serverExecute = function(_in, inData, response) {
        console.log(inData);
        if(this.serveCode != "none"){
          try {
            this.serveCode.execute(_in, inData, message, function(outData) {
              if(typeof response == "function") {
                response(outData);
              }
              else{
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.end(JSON.stringify(outData));
              }    
            });
          }
          catch(e) {   
            if(typeof response == "function") {
              response(JSON.stringify(message.error));
            }
            else {
              response.writeHead(200, {"Content-Type": "text/plain"});
              response.end(JSON.stringify(message.error));
            }
          }
        }
      };
    });
  } 
}

var plugins = new Plugins();

exports.serverExecute = function(_in, postData, response) { 
  var pData = JSON.parse(postData);
  plugins.plugin.forEach(function(plugin) {
    if(plugin.alias==pData.alias){
      plugin.serverExecute(_in, pData, response);
      return;
    }
  });
};

exports.reloadPlugins = function() {
  plugins.reloadPlugins();
}

exports.fire = function(template, place, stepFoo) {
  plugins.plugin.forEach(function(plugin){
    if(plugin.applyTo.indexOf(place) != -1) { 
      try {
        var JS = JSON.parse(template);
        template = template.replaceAll(plugin.content.replace, plugin.content.replaceWith.escapeSpecialChars());
      }
      catch(e) {
        template = template.replaceAll(plugin.content.replace, plugin.content.replaceWith);
      }
    }
    else{
      template = template.replaceAll(plugin.content.replace, '');
    }
  });
  stepFoo(template);   
};

exports.fireAdmin = function(response) { 
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end(JSON.stringify(plugins));
};

exports.savePlugin = function(fs, data, stepFoo) {
  var postDadaObj = JSON.parse(data);
  var name = postDadaObj.name;
  var author = postDadaObj.author;
  var description = postDadaObj.description;
  var replace = postDadaObj.replace;
  var replacewith = postDadaObj.replacewith;
  var applyto = postDadaObj.applyto;
  var alias = postDadaObj.alias;
  applyto = applyto.split(",");
  var curP;
  plugins.plugin.forEach(function(plugin) {
    if(plugin.alias == alias) curP = plugin;
  });
  if(curP === undefined) {
    stepFoo("error");
    return;
  }
  var pluginJSON = new Object({
    "name": name,
    "author":author,
    "description":description,
    "content":{
      "replace":replace,
      "source":curP.content.source,
      "replaceWith":""
    },
    "applyTo":applyto
  });
  try {
    fs.writeFileSync( __dirname + "/plugins/" + alias + "/plugin.json"
                     , JSON.stringify(pluginJSON, null, 4)
                     , 'utf-8');
    fs.writeFileSync( __dirname + "/plugins/" + alias + "/" + curP.content.source
                     , replacewith
                     , 'utf-8');
  }
  catch(exception_var) {
    console.log('saving plugin error: ' + exception_var);
    stepFoo("error");
    return;
  }
  stepFoo("done");
}