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

//InvaNode core app

var options = require("./options");
var db = require("./db");
var api = require("./api");
var plugins = require("./plugins");
var cache = require("./cache");
var template = require("./templates").template;
var http = require("http");
var crypto = require('crypto');
var path = require('path');
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");
var routingGraph = options.routingGraph;

function respDone(response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end('done');
}

function respError(response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end('error');
}

function respGoIndex(response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  response.end('<script>window.location.href = "/";</script>');
}

function respShow404(response) {
  response.writeHead(404, {"Content-Type": "text/html"});
  response.end(template.base.page404);
}

function respTrue(response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end('true');
}

function respFalse(response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end('false');
}

function respData(data, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.end(data);
}

function respJSON(data, response) {
  try{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end(JSON.stringify(data));
  }
  catch(e){
    console.log('error sending json on respJSON():' + e);
    respError(response)
  }
}

function respShow301(location, response) {
  response.writeHead(301, {"Location":location});
  response.end();
}

console.log('InvaNode started');

String.prototype.replaceAll = function(find, replace_to) {
  return this.replace(new RegExp(find, "g"), replace_to);
};

String.prototype.md5 = function() {
  return crypto.createHash('md5').update(this).digest("hex");
};

function getFormattedDate(raw) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  var date = '<span class="date-d">' + raw.getDate() + '</span> <span class="date-m">' + 
             monthNames[raw.getMonth()] + '</span> <span class="date-y">' +
             raw.getFullYear() + '</span>'
  return date;
}

function getPagination(curPage, count) {
  var out = '';
  var numPages = Math.ceil(count/options.numPostPerPage);
  if(numPages == 1) {
    return out;
  }
  else{
    for(var i = 1; i <= numPages; i++)
    {
      if(i==curPage) out +='<span page-type="pagination" class="current-page-number a">'+i+'</span>'
      else out += '<a page-type="pagination" alias="?page=' +  i + 
                  '" page-pagenum="' + i + '" href="?page=' + i + '">' + i + '</a>'
    }
    return out;
  }
}

function getCategorization() {  
  db.getCategories(function(data){
    data.forEach(function(cat){
      if(cat.perrent !="null"){
        db.categorization[cat.alias] = cat;
      }
    });
  });
} 

function popTemplate(request, response, urlQuery, fname, dname) {   
  var forbiddenAlias = ["api", "login", "logout", "admin"];
  if(forbiddenAlias.indexOf(fname) != -1){
    respShow404(response);
    return;
  }
  var pagination = {
    start:0, 
    stop: options.numPostPerPage
  };
  if(urlQuery.page){
    pagination.start = (urlQuery.page - 1)*(options.numPostPerPage);
    pagination.stop = pagination.start + options.numPostPerPage;
  }
  else{
    urlQuery.page = 1;
  }
  var outTemplate = "nodata";
  var cookies = {};
  request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  db.getMainMenu(fname, dname, "html", function(res) {
    getPageContent(fname, dname, pagination, function(cont){
      var title;
      if(cont===undefined){
        respShow404(response); 
      }
      else{
        if(cont.code)
        {
          respError(response);
          return;
        }
        var searchQuery = '';
        if(fname==="" && dname=="/"){
          outTemplate = template.base.header+template.base.index+template.base.footer;
          title = options.vars.title;
          cont.type = "index";
        } 
        else if(dname=="/tag" || dname=="/search" || dname == "/author" || dname == "/category"){
          outTemplate = template.base.header+template.base.search+template.base.footer;
          title = "Search | "+options.vars.title;
          cont.type = "search";
          searchQuery = 'Search by ' + cont.searchPlace + ': <span>' + 
                        decodeURIComponent(fname) + '</span>';
        }
        else {
         cont.template = cont.template ? cont.template : "base";
          if(cont.type == "pages"){
            outTemplate = template[cont.template].header+template[cont.template].page+template[cont.template].footer; 
          }
          else if(cont.type == "posts") {
            if((dname+'/'+fname) != '/' + buildRoutingGraph(cont.type,
                                                            cont._id,
                                                            cont.alias,
                                                            cont.categories[0],
                                                            cont.time)){
              respShow404(response);
              return;
            }
            outTemplate = template[cont.template].header+template[cont.template].post+template[cont.template].footer;
          }
          title = cont.name+' | '+options.vars.title;
        }
        if(outTemplate == "nodata") {
          respShow301(options.vars.siteUrl, response);
          return;
        }
        var tags = '';
        if(!cont.tags || cont.tags == false)
        {
          cont.tags = [];
          tags='<i>none</i>'
        }
        else{
          cont.tags.forEach(function(tag){
            tags += '<span><a alias="tag/' + tag + '" page-type="tags" page-alias="' +
                    tag + '" page-title="Search" href="/tag/' + tag + '">' + tag + '</a></span>';
          });
        }
        var categories='';
        if(!cont.categories || cont.categories == false)
        {
          cont.categories = [];
          categories='<i>none</i>'
        }
        else{
          cont.categories.forEach(function(cat){
            categories += '<span><a alias="category/' + cat + 
                          '" page-type="categories" page-alias="' + cat + 
                          '" page-title="Search" href="/category/' + cat + 
                          '">'+cat+'</a></span>'
          });
        }
        var author = '<span><a alias="author/' + encodeURIComponent(cont.author) + 
                     '" page-type="author" page-alias="' +
                     encodeURIComponent(cont.author) +
                     '" page-title="Search" href="/author/' + 
                     encodeURIComponent(cont.author) + '">' + 
                     cont.author + '</a></span>';
        plugins.fire(outTemplate
              .replaceAll("{{JS_CUR_PAGE_URL}}", fname)
              .replaceAll("{{JS_SITE_URL}}",options.vars.siteUrl)
              .replaceAll("{{JS_SITE_NAME}}",options.vars.appName)
              .replaceAll("{{NUM_POSTS_PER_PAGE}}", options.numPostPerPage)
              .replaceAll("{{ROUTING_GRAPH}}",routingGraph)
              .replaceAll("{{POST_NAME}}", cont.name)
              .replaceAll("{{POST_DATE}}", getFormattedDate(new Date(cont.time*1000)))
              .replaceAll("{{PAGE_CONTENT}}", cont.smalldata+cont.data)
              .replaceAll("{{PAGINATION}}", getPagination(urlQuery.page, cont.allEntityCount))
              .replaceAll("{{MAIN_MENU}}", res)
              .replaceAll("{{TITLE}}", title)
              .replaceAll("{{APPNAME}}", options.vars.appName)
              .replaceAll("{{SITE_URL}}", options.vars.siteUrl)
              .replaceAll("{{SEARCH_QUERY}}", searchQuery)
              .replaceAll("{{POST_AUTHOR}}", author)
              .replaceAll("{{POST_TAGS}}", tags)
              .replaceAll("{{POST_CATEGORIES}}", categories)
              .replaceAll("{{PAGE_TYPE}}", cont.type)
              .replaceAll('{{PAGE_DESCRIPTION}}', cont.description),
          cont.type, function(data){
            response.writeHead(200, {"Content-Type": "text/html"});
            response.end(data);
          }
        );
      }
    });
  });                 
}

function popAdminTemplate(userObj, request, response) {       
  try{
    var logged = fs.readFileSync(__dirname+"/template/admin/logged.html", 'utf-8');
    var admin =  fs.readFileSync(__dirname+"/template/admin/" + options.adminTemplate, 'utf-8');
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(admin.replaceAll("{{APPNAME}}", options.vars.appName)
                        .replaceAll("{{SITE_URL}}", options.vars.siteUrl)
                        .replaceAll("{{USER_MENU}}", logged)
                        .replaceAll("{{USER_NAME}}", userObj.name)
                        .replaceAll("{{USER_LEVEL}}", userObj.level));
    response.end();
  }    
  catch(e){
    respShow404(response);
    console.log("file loading error: " + e);
  }    
}

function getLocalImages(stepFoo) { 
  fs.readdir(__dirname+"/images",function(error, files){
    if(error){
      console.log(error);
      stepFoo("error")
    }
    else{    
      stepFoo(files);
    }
  });
}

function buildRoutingGraph(type, id, alias, category, date) {
  var monthnum = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  var url = routingGraph.replaceAll(":category", category)
                        .replaceAll(":alias", alias)
                        .replaceAll(":id", id)
                        .replaceAll(":year", new Date(date*1000).getFullYear())
                        .replaceAll(":monthnum", monthnum[new Date(date*1000).getMonth()])
                        .replaceAll(":day", new Date(date*1000).getDate());
  return url;            
}

function getPageContent(fname, dname, pagination, stepFoo) {
  var results = {
    _id:'',
    time:'',
    name:'',
    data:'',
    smalldata:'',
    alias:'',
    type:'',
    tags: [],
    description:options.vars.indexDescription,
    searchPlace:'',
    allEntityCount:0
  }; 
  var contentSetter = function(contents) {
    if(contents.code === undefined){
      if(contents.length > 0){
        if(contents[0].type=='index' && results.type == 'index'){
          results = contents[0];
          stepFoo(results);                             
        }
        else{
          var contMax = pagination.stop;
          if(pagination.stop == Infinity || pagination.stop > (contents.length)){
            contMax = contents.length;
          }
          results.allEntityCount = contents.length; 
          var contMin = pagination.start;
          var i = contMin - 1;
          while (++i < contMax)
          { 
            var categories='';
            if(!contents[i].categories || contents[i].categories == false)
            {
              contents[i].categories = [];
              categories='<i>none</i>'
            }
            else{
              contents[i].categories.forEach(function(cat){
                if(db.categorization[cat].searchable==1){
                  categories +='<span><a alias="category/' +
                               cat + '" page-type="categories" page-alias="' +
                               cat + '" page-title="Search" href="/category/' +
                               encodeURIComponent(cat) + '">' + cat + '</a></span>';
                }           
              });
            }
            if(results.type=='index')
            {
              if(contents[i].categories != false) {
                if(db.categorization[contents[i].categories[0]].onindex == 0 
                  || db.categorization[contents[i].categories[0]].searchable == 0) 
                {
                  if(contMax != contents.length){
                    contMax++;
                  }
                  continue;
                }
            }  
            }
            if(results.type=='search')
            {
              if(contents[i].categories != false) {
                if(db.categorization[contents[i].categories[0]].searchable == 0) {
                  if(contMax != contents.length){
                    contMax++;
                  }
                  continue;
                }
              }  
            }
            var tags='';
            if(!contents[i].tags || contents[i].tags == false)
            {
              contents[i].tags = [];
              tags='<i>none</i>'
            }
            else{
              contents[i].tags.forEach(function(tag){
                tags +='<span><a alias="tag/' + tag + '" page-type="tags" page-alias="' + 
                       tag + '" page-title="Search" href="/tag/' + encodeURIComponent(tag) + '">' + tag + '</a></span>'
              });
            }
            
            var author =  '<span><a alias="author/' + encodeURIComponent(contents[i].author) + 
                          '" page-type="author" page-alias="' +
                          encodeURIComponent(contents[i].author) +
                          '" page-title="Search" href="/author/' + 
                          encodeURIComponent(contents[i].author) + '">' + 
                          contents[i].author + '</a></span>';
            var rGraph = buildRoutingGraph(contents[i].type, contents[i]._id, 
                                           contents[i].alias, contents[i].categories[0], 
                                           contents[i].time);            
            contents[i].template = contents[i].template ? contents[i].template : "base";
            try{
              results.data += template[contents[i].template].small_post.replaceAll("{{SMALL_POST_NAME}}", contents[i].name)
              .replaceAll("{{SMALL_POST_DATE}}", getFormattedDate(new Date(contents[i].time*1000))) 
              .replaceAll("{{SMALL_POST_CONTENT}}", contents[i].smalldata)
              .replaceAll("{{SMALL_POST_LINK}}", options.vars.siteUrl + rGraph)
              .replaceAll("{{PAGE_ALIAS}}", contents[i].alias)
              .replaceAll("{{LINK_ALIAS}}",  rGraph)
              .replaceAll("{{POST_TAGS}}", tags)
              .replaceAll("{{POST_CATEGORIES}}", categories)
              .replaceAll("{{POST_AUTHOR}}", author)
              .replaceAll("{{PAGE_TYPE}}", contents[i].type)
              .replaceAll("{{LINK_TITLE}}", contents[i].name.replaceAll('["]', "\\'"));
            }
            catch(e){
              console.log("small_post templating error: "+e);
              stepFoo("error");
            }                        
          }
          stepFoo(results);
        }
      }
      else{
        results.data = '<div class="nothing-was-found">Nothing was found...</div>'
        stepFoo(results);
      }
    }
    else{
      stepFoo("error");
    }
  }
  if(fname==="" && dname=="/"){
    results.type='index';
    db.getIndexContent(contentSetter);  
  }
  else if(dname=="/tag" || dname=="/search"){
    results.type = 'search';
    results.searchPlace='tag';
    db.getRegularEntityByTag(decodeURIComponent(fname), contentSetter);
  }
  else if(dname == "/author"){
    results.type = 'search';
    results.searchPlace='author';
    db.getRegularEntityByAuthor(decodeURIComponent(fname), contentSetter);
  }
  else if(dname == "/category"){
    results.type = 'search';
    results.searchPlace='category';
    db.getRegularEntityByCategory(decodeURIComponent(fname), contentSetter);
  }
  else{                     
    db.getRegularEntityByAlias(fname, dname, stepFoo);
  }
}

function editOldData(postData, request, response) {   
  try{
    var postDadaObj = JSON.parse(postData);
  }
  catch(e){
    console.log('error reading postData at editOldData():' + e);
    respError(response);
    return;
  }
  switch(postDadaObj.todo)
  {   
    case "delete":
      db.deleteDataProc(request, postDadaObj, function(err){
        if(!err){
          respDone(response);
        }
        else{
          respGoIndex(response); 
          console.log("login error");
        }
      });
      break;
    case "edit":
      db.editDataProc(request, postDadaObj, function(err){
        if(!err){
          respDone(response);
        }
        else{
          respGoIndex(response);
          console.log("login error");
        }
      });
      break;
    case "edit_category":
      db.editCatProc(request, postDadaObj, function(err){
        if(!err){
          respDone(response);
          getCategorization();
        }
        else{
          respGoIndex(response);
          console.log("login error");
        }
      });
    break;     
    case "edit_user_pass":
      db.editUserProc(request, postDadaObj, function(err){
        if(!err){
          respDone(response);
        }
        else{
          respGoIndex(response);
          console.log("login error");
        }
      });
      break;        
    case "opendata":
      db.openDataForEditProc(request, postDadaObj, function(err, data){
        if(!err){
          respData(data, response);
        }
        else{
          respGoIndex(response); 
          console.log("login error");
        }
      });
      break;    
    default:
      respData('error', response);
      return;
      break;
  }  
}

function saveNewData(postData, request, response) {
  try{
    var postDadaObj = JSON.parse(postData);
  }
  catch(e){
    console.log('error reading postData at saveNewData():' + e);
    respError(response);
    return;
  }  
  var forbiddenAlias = ["api", "login", "logout", "admin"]
  if(forbiddenAlias.indexOf(postDadaObj.alias) != -1){
    respData('You can\'t use word <b>"'+ postDadaObj.alias + '"</b> as alias.', response)
    return;
  }
  switch(postDadaObj.type)
  {   
    case "posts":
    case "pages":
    case "users":
      db.saveDataProc(request, postDadaObj.type, postDadaObj, function(err){
        if(!err){
          respDone(response);
        }    
        else{
          respGoIndex(response);
          console.log("login error");
        }
      });                 
      break;
    case "categories":
      db.saveNewCatProc(request, postDadaObj, function(err){
        if(!err){
          respDone(response);
          getCategorization();
        }    
        else{
          respGoIndex(response); 
          console.log("login error");
        }
      });   
      break;        
    default:
      respError(response);
      break;
  } 
}

function uploadImageFile(postData, request, response) {
  try{
    var postDadaObj = JSON.parse(postData);
  }
  catch(e){
    console.log('error reading postData at uploadImageFile():' + e);
    respError(response);
    return;
  }  
  var data = postDadaObj.filedata;
  var name = postDadaObj.name;
  var size = postDadaObj.size;                       
  db.loggedIn(request, function(check, userObj){                            
    if(check){
      try{           
        var dta64 = data.split(',');
        var buf = new Buffer(dta64[1], 'base64');
        fs.open(__dirname+"/images/"+name, 'w', 0755, function(err, fd){
          fs.write(fd, buf, 0, buf.length, 0, function(err, written, buffer){
            if(err) {
              respError(response);
              console.log(err); 
            }
            else{
              respDone(response);
            }    
          });        
        });
      }
      catch(errorCatched){
        console.log(errorCatched);
      }
    }
    else{
      respError(response); 
      console.log("login error");
    }
  });
}

function processTemplateData(postData, request, response) {
  try{
    var postDadaObj = JSON.parse(postData);
  }
  catch(e){
    console.log('error reading postData at processTemplateData():' + e);
    respError(response);
    return;
  } 
  var fname = postDadaObj.fname;
  var todo = postDadaObj.todo;
  var fdata = postDadaObj.fdata;
  var alias = postDadaObj.alias;
  db.loggedIn(request, function(check, userObj){
    if(check){
      switch(todo)
      {
        case 'get':
          fs.readFile(__dirname+"/template/theme/" + alias+ "/" + fname, function(err, data){
            if(err)
            {
              respError(response);
              console.log(err);
            }
            else{
              response.writeHead(200, {
                "Content-Type": "text/plain"
              });
              response.end(data);
            }
          });       
          break;
        case 'save':
          fs.writeFile(__dirname+"/template/theme/" + alias+ "/"  + fname, fdata, function(err){
            if(err) {
              respError(response);
              console.log(err);
            }
            else{
              template[alias].reloadTemplate(request, response);
            }    
          });        
          break;
      }
    }    
    else{
      respError(response); 
      console.log("login error");
    }  
  });
}

function apiCall(request, response) {   
  var postData = "";
  var postDadaObj = {};
  request.setEncoding("utf8");
  request.addListener("data", function(postDataChunk) {
    postData += postDataChunk;
  });
  request.addListener("end", function() {
    postData && postData.split('&').forEach(function( onePostData ) {
      var postParts = onePostData.split('=');
      postDadaObj[postParts[0].trim()] = (postParts[1]||'').trim();
    });
    var call = querystring.parse(postData).call;
    var data = querystring.parse(postData).data;
    switch(call){
      case "is_logged_in":
        db.loggedIn(request, function(check, userObj){
          if(check){
            respData('{logged:"true","name":"' + userObj.name + '",level:"' + 
                     userObj.level + '"}', response);
          }
          else{
            respFalse(response) 
          }
        });
        break;
      case "get_local_images":
        db.loggedIn(request, function(check, userObj){
          if(check){  
            getLocalImages(function(localImages){
              respJSON(localImages, response);
            });
          }
          else{
            respError(response);
          }
        });
        break;
      case "reload_template_immediate":
          db.loggedIn(request, function(check, userObj){
            try {
              data = JSON.parse(data);
              if(data.alias && check && userObj.level == 0){ 
                template[data.alias].reloadTemplate(request, response);
              }
              else{
                respError(response);
              }
            }
            catch (e) {
              respError(response);
            }
          });
        break;
      case "load_all_pages":
        db.getAll(request, 'pages', function(outData){
          respData(outData, response);
        });
        break;
      case "load_all_posts":
        db.getAll(request, 'posts', function(outData){
          respData(outData, response);
        });
        break;
      case "load_all_categories":
        db.getAll(request, 'categories', function(outData){
          respData(outData, response);
        });
        break;                
      case "load_all_users":
        db.getAll(request, 'users', function(outData){
          respData(outData, response);
        });
        break;
      case "load_all_templates":
        db.loggedIn(request, function(check, userObj){
          try {
            data = JSON.parse(data);
            var tplAlias = data.alias ? data.alias : '';
            if(check && userObj.level == 0){
              fs.readdir(__dirname + "/template/theme/" + tplAlias, function(error, files){
                if(error){
                  console.log(error);
                  respError(response);
                }
                else{
                  respJSON(files, response);
                }
              });
            }
            else{
              respError(response);
            }
          }
          catch (e) {
            respError(response);
          }
         }); 
        break;     
      case "process_template_data":
        db.loggedIn(request, function(check, userObj){
          if(check && userObj.level == 0){
            processTemplateData(data, request, response);                     
          }
          else{
            respError(response);
          }
        });
        break;
      case "upload_image_file":
        db.loggedIn(request, function(check, userObj){  
          if(check) {
            uploadImageFile(data, request, response);
          }
          else {
            respError(response);
          }
        });  
        break;
      case "post_page_savings":
        saveNewData(data, request, response);                     
        break;
      case "post_page_editing":
        editOldData(data, request, response);                     
        break;
      case "get_entity_by_alias":
        api.getEntityByAlias(data, db, plugins, function(data){
          respJSON(data, response);
        });
        break;
      case "get_entity_by_id":
        api.getEntityById(data, db, plugins, function(data){
          if(data == 'error') respData(data, response)
          else respJSON(data, response);
        });
        break;
      case "search_by_tag":
        api.getEntityByTag(data, db, plugins, function(data){
          respData(data, response)
        });
        break; 
      case "search_by_author":
        api.getEntityByAuthor(data, db, plugins, function(data){
          respData(data, response)
        });
        break;
      case "search_by_category":
        api.getEntityByCategory(data, db, plugins, function(data){
          respData(data, response)
        });
        break;                
      case "get_latest_posts":
        api.getLatestPosts(data, db, plugins, function(data){
          if(data == 'error') respData(data, response)
          else respData(data, response);
        });
        break;
      case "get_posts":
        api.getPosts(data, db, plugins, function(data){
          if(data == 'error') respData(data, response)
          else respData(data, response);
        });
        break;                
      case "get_all_pages":
        api.getAllPages(request, db, plugins, function(data){
          respData(data, response);
        });
        break;
      case "get_page_type":
        api.getPageType(data, db, function(data){
          respData(data, response);
        });
        break;
      case "get_categories":
        api.getCategories(db, function(data){
          if(data == 'error') respData(data, response)
          else respJSON(data, response);
        });
        break;           
      case "load_plugins_admin":
        db.loggedIn(request, function(check, userObj){
          if(check && userObj.level == 0){
            plugins.fireAdmin(response);
          }
          else{
            respError(response); 
          }
        });
        break;
      case "save_plugin":
        db.loggedIn(request, function(check, userObj){
          if(check && userObj.level == 0){
            plugins.savePlugin(fs, data, response);
          }
          else{
            respError(response); 
          }
        });
        break;
      case "get_template":
        api.getTemplate(data, template.base, plugins, function(data){
          respData(data, response);
        });
        break;
      case "get_index":
        api.getIndex(data, db, plugins, function(data){
          respData(data, response);
        });            
        break;
      case "set_index":
        api.setIndex(request, data, db, function(data){
          respData(data, response);
        });            
        break;                
      case "reload_plugins":
        db.loggedIn(request, function(check, userObj){
          if(check && userObj.level == 0){
            plugins.reloadPlugins(response);
          }
          else{
            respError(response);
          }
        });  
        break;
      case "plugin":
        var _in = api.textApi(db, template.base, request, plugins);
        _in.db = db.db;
        plugins.serverExecute(_in, data, response);
        break;
      case "load_dashboard":
        api.loadDashboard(request, db, function(data){
          if(data == 'error') {
            respData(data, response)
          }
          else {
            respJSON(data, response);
          }
        });
        break;
      default:
        respError(response);
        break;
    } 
  });
}

function makeLogin(request, response) {
  db.setLogin(request, function(sessionHash, error){
    if(error == 1) {
      respGoIndex(response); 
      console.log("login error");
    }
    else{
      response.writeHead(301, { 
        "Set-Cookie": "INSSID="+sessionHash+"; path=/",
        "Location": options.vars.siteUrl+"admin"
      });
      response.end();
    }
  });
}

function makeLogout(response) {
  response.writeHead(200, {
    "Set-Cookie": "INSSID=EXP; expires=Fri, 31 Dec 2010 23:59:59 GMT; path=/",
    "Content-Type": "text/html"
  });
  response.end('<script>window.location.href = "/";</script>');
}

function serveStatic(dname, fname, ext, response) {
  function respS(data){
    var mime = {
      ".txt": "text/plain",
      ".css": "text/css",
      ".js": "text/javascript",
      ".htm": "text/html",
      ".html": "text/html",
      ".jpeg": "image/jpeg",
      ".jpg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".ico": "image/x-icon"
    }
    response.writeHead(200, {"Content-Type": mime[ext]});
    response.end(data);
  }
  var forbiddenFiles = ['index.js', 
                        'options.js', 
                        'db.js', 
                        'api.js', 
                        'plugins.js', 
                        'cache.js', 
                        'template.js'];
  if(forbiddenFiles.indexOf(fname) != -1) {
    respShow404(response);
    return;
  }
  else if(fname=="style.css" && dname=='/template/theme/base'){
    respS(template.base.style);
    return;
  }
  else if(fname == "jquery.js" && dname=='/template/assets/js'){
    respS(template.base.jquery);
    return;
  }
  else if(fname == "in.js" && dname=='/template/assets/js'){
    respS(template.base.injs);
    return;
  }
  var filePath = path.join(dname, fname);
  if(cache.cacheStatic[filePath] !== undefined){
    respS(cache.cacheStatic[filePath]);
  }
  else{
    fs.readFile(__dirname+dname+"/"+ decodeURI(fname), function(error, data){
      if(!error){
          respS(data);
      }
      else{
        respShow404(response);
        console.log(error);
      }
    });
  }
}

function httpHandler(request, response) {
  var urlStringParsed = url.parse(request.url, true);
  var fname =  path.basename(urlStringParsed.pathname);
  var urlQuery = urlStringParsed.query;
  var ext = path.extname(request.url); 
  var dname = path.dirname(request.url);
  if(ext !== ""){
    serveStatic(dname, fname, ext, response);      
  }
  else{   
    if(fname == "api"){
      apiCall(request, response);
    }
    else{
      switch(fname){   
        case "admin":
          db.loggedIn(request, function(check, userObj){              
            if(check){
              popAdminTemplate(userObj, request, response);
            }
            else{
              response.writeHead(200, {"Content-Type": "text/html"});
              response.end(template.base.loginpage);  
            }
          });
          break;
        case "login":
          makeLogin(request, response); 
          break;
        case "logout":
          makeLogout(response);               
          break;
        default:
          popTemplate(request, response, urlQuery, fname, dname);
          break;
      } 
    }
  }
}

http.createServer(httpHandler).listen(options.vars.serverListenPort, options.vars.serverListenIP);