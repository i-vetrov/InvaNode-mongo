/**
 * @license InvaNode CMS v0.1.3
 * https://github.com/i-vetrov/InvaNode
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

// InvaNode templates

var db = require("./db");
var fs = require("fs");
var options = require("./options");
var template = {};

var tplFiles = {
  "header": "header.html",
  "index": "index.html",
  "page": "page.html",
  "post": "post.html",
  "footer": "footer.html",
  "small_post": "small_post.html",
  "page404": "404.html",
  "loginpage": "loginpage.html",
  "style": "style.css",
  "search": "search.html"
};

function Template() {
  this.initTemplate = function(alias, stepFoo) {
    var context = this;
    context.alias = alias;
    var themeDir = __dirname + "/template/theme/" + alias + "/";
    for(var tpl in tplFiles) {
      try {
        context[tpl] = fs.readFileSync(themeDir + tplFiles[tpl], 'utf-8');
      }
      catch(exception_var) {
        if(alias == "base") {
          console.log('reloading template error: '+exception_var);
          if(stepFoo){
            stepFoo(true);
          }
        }
        else {
          context[tpl] = template.base[tpl];
        }
      }
    }
    try {
      context.jquery = fs.readFileSync(__dirname + "/template/assets/js/jquery.js", 'utf-8');
      context.injs = fs.readFileSync(__dirname + "/template/assets/js/in.js", 'utf-8');
      if(stepFoo){
          stepFoo(false);
      }
    }
    catch(exception_var) {
      console.log('reloading template error: '+exception_var);
      if(stepFoo){
        stepFoo(true);
      }
    }
  };
  this.reloadTemplate = function(request, response) {
    var context = this;
    db.loggedIn(request, function(check, userObj){              
      if(check && userObj.level == 0){
        context.initTemplate(context.alias, function(error){
          if(!error){
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end('done');
          }
          else{
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end('error');
          }
        });
      }
      else{
        respGoIndex(response);
        console.log("login error"); 
      }
    });                        
  };
}

function getTemplates() {
  var list = fs.readdirSync(__dirname + "/template/theme");
  list.forEach(function(file){
    if(file != "base") {
      template[file] = new Template();
      template[file].initTemplate(file);
    }
  });
}

template.base = new Template();
template.base.initTemplate("base");
getTemplates();
exports.template = template;