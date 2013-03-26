/**
 * @license InvaNode CMS v0.1.1
 * https://github.com/i-vetrov/InvaNode
 * https://github.com/i-vetrov/InvaNode-mongo
 *
 * Author: Ivan Vetrau (http://www.invatechs.com/)
 *
 * Copyright (C) 2013 Ivan Vetrau 
 * Licensed under the MIT license (MIT)
 **/

// MongoDB database functions

var options = require("./options");
var mongo = require('mongodb').MongoClient;
var crypto = require('crypto');
var db;

mongo.connect("mongodb://"+options.vars.dbHost+":"+options.vars.dbPort+"/"+options.vars.dbName, {
  auto_reconnect: true}, 
  function(err, d) {
    if(!err) {
      db = d;
      exports.db = db;
    }
    else{
      console.log("MongoDB connection error " + err);
    }
  }
);

exports.getIndexContent = function (stepFoo)
{
  db.collection("pages").findOne({type:"index",published:1}, function(err, results){
    if(err){
      console.log(err);
      stepFoo(err);
    }
    else{
      if(results!==null){
        var res = [results];
        stepFoo(res);
      }
      else{
        db.collection("posts").find({published:1}).sort({_id: -1}).toArray(function(err, results){
          if (err) {
            console.log(err);
            stepFoo(err);
          }
          else{
            stepFoo(results);
          }
        });
      }
    }
  });
}

exports.getLatestPosts = function(stepFoo)
{
  db.collection("posts").find({published:1}).sort({_id: 1}).toArray(function(err, results) {
    if (err) {
      console.log(err);
      stepFoo(err);
    }
    else{
      stepFoo(results);
    }
  });
}

exports.setIndexContent = function(request, data, stepFoo)
{
  if(!data){
    stepFoo("error");
  }
  else{
    loggedIn(request, function(check, userObj){
      if(check){ 
        db.collection("pages").update({type:"index"}, {$set:{type:"pages"}}, {multi:true},
          function(err, result){
            if(err) {
              console.log(err);
              stepFoo("error");
            }
            else{
              if(data.set != "$list_of_posts"){
                db.collection("pages").update({alias:data.set}, {$set:{type:"index"}},
                  function(err, result){
                    if(err) {
                      console.log(err);
                      stepFoo("error");
                    }
                    else{
                      stepFoo("done");
                    }
                  }
                );
              }
              else{
                stepFoo("done");
              }
            }
          }
        );
      }
      else{
        console.log('login error');
        stepFoo("error");
      }
    });
  }
}

exports.getRegularEntityByAlias = function (fname, dname, stepFoo)
{
  db.collection("posts").findOne({alias:fname,published:1}, function(err, result){
    if(result == null){
      db.collection("pages").findOne({alias:fname,published:1}, function(err, result){
        if(result == null){
          stepFoo(undefined);
        }
        else{
          stepFoo(result);
        }
      });
    }
    else{
      stepFoo(result);
    }
  });
}

exports.getRegularEntityById = function (id, type, stepFoo)
{
  db.collection("posts").findOne({_id:id,published:1}, function(err, result){
    if(result == null){
      db.collection("pages").findOne({_id:id,published:1}, function(err, result){
        if(result == null){
          stepFoo(undefined);
        }
        else{
          stepFoo(result);
        }
      });
    }
    else{
      stepFoo(result);
    }
  });
}

exports.getRegularEntityByTag = function (fname, stepFoo)
{
  db.collection("posts").find({tags:fname,published:1}).sort({_id: 1}).toArray(
    function(err, result_posts){
      if (!err){
        db.collection("pages").find({tags:fname,published:1}).sort({_id: 1}).toArray(
          function(err, result_pages){
            var result = result_posts.concat(result_pages)
            stepFoo(result);
          }
        );
      }    
      else{
        stepFoo("error");
      }
    }
  );
}

exports.getRegularEntityByAuthor = function (fname, stepFoo)
{
  fname = decodeURIComponent(fname);
  db.collection("posts").find({author:fname,published:1}).sort({_id: 1}).toArray(
    function(err, result_posts){
      if (!err){
        db.collection("pages").find({author:fname,published:1}).sort({_id: 1}).toArray(
          function(err, result_pages){
            var result = result_posts.concat(result_pages)
            stepFoo(result);
          }
        );
      }    
      else{
        stepFoo("error");
      }
    }
  );
}

exports.getRegularEntityByCategory = function (fname, stepFoo)
{
  fname = decodeURIComponent(fname);
  db.collection("posts").find({categories:fname,published:1}).sort({_id: 1}).toArray(
    function(err, result_posts){
        if (!err){
          db.collection("pages").find({categories:fname,published:1}).sort({_id: 1}).toArray(
            function(err, result_pages){
              var result = result_posts.concat(result_pages)
              stepFoo(result);
            }
          );
        }    
        else{
          stepFoo("error");
        }
    }
);
}

coutStatistics = function (stepFoo)
{     
  var outResults={
    pages_num: 0,
    posts_num: 0,
    users_num: 0
  };
    db.collection("pages").find().toArray(function(err, results){
      if (err) {
        console.log(err);
      }
      else{
        outResults.pages_num = results.length;
        db.collection("posts").find().toArray(function(err, results){
          if (err) {
            console.log(err);
          }
          else{
            outResults.posts_num = results.length
            db.collection("users").find().toArray(function(err, results){
              if (err) {
                console.log(err);
              }
              else{
                outResults.users_num = results.length
                stepFoo(outResults);
              }
            }); 
          }
        });    
      }
    });
}
exports.coutStatistics = coutStatistics;

exports.countPostsNum = function (searchObj, stepFoo){
  var query = {published:1};
  if(searchObj.author){
    query.author = searchObj.author;
  }
  if(searchObj.tags){
    query.tags = searchObj.tags;
  }
  if(searchObj.categories){
    query.categories = searchObj.categories;
  }
  db.collection("posts").find(query).toArray(function(err, results){
    if (err) {
      console.log(err);
    }
    else{
      stepFoo(results.length);
    }
  });              
}

exports.editDataProc = function (request, data, stepFoo)
{   
  try{
    var name = data.name;
    var text = data.text;
    var afterCut = text.split("--CUT--");
    if(afterCut[1]===undefined){
      afterCut[1]='';
    }
    var alias = data.alias;
    var type = data.type;
    var id = data.id;
    var description = data.description;
    var published = data.published;
    var tags = data.tags.trim();
    tags = tags.split(" ");
    var categories = data.categories;
  }
  catch(e){
    stepFoo(true);
  }
  var Types = ['posts', 'pages'];
  if(Types.indexOf(type) != -1){
    loggedIn(request, function(check, userObj){
      if(check){
        db.collection(type).update({
            _id:id
          },
          {$set:{
            name:name, 
            data:afterCut[1], 
            smalldata:afterCut[0], 
            alias:alias, 
            description:description, 
            published:published, 
            tags:tags, 
            author:userObj.penname, 
            categories:categories
            }}, {w:1},
          function(err, results){
            if(!err){
              stepFoo(false);           
            }
            else{
              console.log(err);
              stepFoo(true);
            }
        });
      }
      else{
        stepFoo(true);
      }
    });
  }    
  else{
      stepFoo(true);
  }
}

exports.editCatProc = function(request, data, stepFoo)
{
  try{
    var id = data.id;    
    var parent = data.parent;
    var type = 'categories';
  }
  catch(e){
    stepFoo(true);
  }
  var Types = ['categories'];
  if(Types.indexOf(type) != -1){
    loggedIn(request, function(check, userObj){
      if(check){
        db.collection(type).update({_id:id}, {$set:{parent:parent}}, {w:1}, 
          function(err, results){
            if(!err){
              stepFoo(false);           
            }
            else{
              console.log(err);
              stepFoo(true);
            }
          }
        );
      }
      else{
        stepFoo(true);
      }
    });
  }    
  else{
    stepFoo(true);
  }
}

exports.saveNewCatProc = function (request, data, stepFoo)
{
    try{
      var name = data.name;
      var alias = data.alias;
      var parent = data.parent;
      var type = 'categories';
    }
    catch(e){
      stepFoo(true);
    }
    var Types = ['categories'];
    if(Types.indexOf(type) != -1){
      loggedIn(request, function(check, userObj){
        if(check){
            db.collection('counters').findAndModify({_id:type}, [['_id','asc']], {$inc:{num:1}}, 
              {'new': true}, 
              function(err, new_id){
                if(!err){
                  db.collection(type).insert({_id:new_id.num,name:name,alias:alias,parent:parent},
                    {w:1}, 
                    function(err, results){
                      if(!err){
                        stepFoo(false);           
                      }
                      else{
                        console.log(err);
                        stepFoo(true);
                      }
                    }
                  );
                }
                else{
                  stepFoo(true);
                }
              }
            );    
        }
        else{
          stepFoo(true);
        }
      });
    }    
    else{
      stepFoo(true);
    }
}

exports.editUserProc = function (request, data, stepFoo)
{   
  try{
    var id = data.id;
    var password = data.password;
  }
  catch(e){
    stepFoo(true);
  }
  loggedIn(request, function(check, userObj){              
    if(check){
      var hash = crypto.createHash('md5').update(password).digest("hex");
      db.collection("users").update({_id:id}, {$set:{password:hash}}, {w:1}, 
        function(err, results){
          if(!err){
            stepFoo(false);           
          }
          else{
            console.log(err);
            stepFoo(true);
          }
        }
      );
    }
    else{
      stepFoo(true);
    }
  });    
}

exports.deleteDataProc = function (request, data, stepFoo)
{
  try{
    var type = data.type;
    var id = data.id;
  }
  catch(e){
    stepFoo(true);
  }
  var Types = ['posts', 'pages', 'users', 'categories'];
  if(Types.indexOf(type) != -1){
    loggedIn(request, function(check, userObj){              
      if(check){
        db.collection(type).remove({_id:id},{w:1}, function(err, results){
          if(!err){
            stepFoo(false);           
          }
          else{
            console.log(err);
            stepFoo(true);
          }
        });
      }
      else{
        stepFoo(true);
      }
    });    
  }
  else
  {
    stepFoo(true);
  }    
}

exports.saveDataProc = function (request, type, data, stepFoo)
{
  if(type!="users"){
    try{
      var date = Math.round(new Date().getTime() / 1000);
      var name = data.name;
      var text = data.text;
      var afterCut = text.split("--CUT--");
      if(afterCut[1]===undefined){
        afterCut[1]='';
      }
      var alias = data.alias;
      var published = data.published;
      var description = data.description;
      var tags = data.tags.trim();
      tags = tags.split(" ");
      var categories = data.categories;
    }
    catch(e){
      stepFoo(true);
    }
  }
  else{
    try{
      var username = data.name;
      var password = data.password;
    }
    catch(e){
      stepFoo(true);
    }
  }
  var Types = ['posts', 'pages', 'users'];
  if(Types.indexOf(type) != -1){    
    loggedIn(request, function(check, userObj){              
      if(check){
        db.collection('counters').findAndModify({_id:type}, [['_id','asc']], {$inc:{num:1}}, 
          {'new': true}, 
          function(err, new_id){
            if(!err){
              if(type!="users"){
                db.collection(type).insert({
                  _id: new_id.num, 
                  time: date, 
                  name: name, 
                  data: afterCut[1],
                  smalldata: afterCut[0], 
                  alias: alias, 
                  type: type, 
                  description: description, 
                  published:published, 
                  tags:tags, 
                  author:userObj.penname,
                  categories:categories
                  }, {w:1},
                  function(){
                    if(!err){
                        stepFoo(false);           
                    }
                    else{
                        console.log(err);
                        stepFoo(true);
                    }
                  }
                );
              }
              else{
                var hash = crypto.createHash('md5').update(password).digest("hex");
                db.collection('users').insert({
                  _id: new_id.num,
                  level:0,
                  name: username,
                  password: hash,
                  session_hash:''},{w:1},
                  function(err, results){
                    if(!err){
                        stepFoo(false);           
                    }
                    else{
                        console.log(err);
                        stepFoo(true);
                    }
                  }
                );
              }
            }
            else{
              stepFoo(true);
            }
          }
        );     
      }
      else{
        stepFoo(true);
      }
    });
  }
  else{
    stepFoo(true);
  }
}

exports.openDataForEditProc = function (request, data, stepFoo)
{
  try{
    var type = data.type;
    var id = data.id;
  }
  catch(e){
    stepFoo(true);
  }
  var Types = ['posts', 'pages', 'users', 'categories'];
  if(Types.indexOf(type) != -1){
    loggedIn(request, function(check, userObj){              
      if(check){
        db.collection(type).findOne({_id:id}, function(err, results){
          if(!err){
            var json = [results];
            stepFoo(false, JSON.stringify(json));           
          }
          else{
            stepFoo(true, "nodata");
            console.log(err);
          }
        });
      }
      else{
        stepFoo(true, "nodata");
      }
    });
  }
  else{
    stepFoo(true, "nodata");
  }
}

exports.getAll = function (request, type, stepFoo)
{
  switch(type)
  {
    case 'categories':
    case 'pages':
    case 'posts':
      loggedIn(request, function(check, userObj){ 
                      var query = {published:1};
                      if(check){
                        query = {};
                      }
                      db.collection(type).find(query).sort({_id: -1}).toArray(function(err, results){
                        if (err) {
                          stepFoo("error");
                          console.log(err);
                        }
                        else{
                          for(i=0;i<results.length;i++)
                          {
                            results[i].id = results[i]._id;
                          } 
                          stepFoo(JSON.stringify(results, function (key, value) {
                            if (typeof value === 'number' && !isFinite(value)) {
                              return String(value);
                            }
                            return value;
                            })
                          );
                        }
                      });
                  });    
      break;
    case 'users':
      loggedIn(request, function(check, userObj){ 
        if(check){
          db.collection("users").find().toArray(function(err, results){
            if (err) {
              stepFoo("error");
              console.log(err);
            }
            else{
              for(i=0;i<results.length;i++)
              {
                results[i].id = results[i]._id;
                results[i].password = '';
                results[i].session_hash = '';
              }    
              stepFoo(JSON.stringify(results, function (key, value) {
                if (typeof value === 'number' && !isFinite(value)) {
                  return String(value);
                }
                return value;
                })
              ); 
            }
          });
        }
        else{
          stepFoo('error');
        }
      });    
      break;
    default:
      stepFoo("error");
      break;
  }
}

exports.getCategories = function(stepFoo){
  db.collection("categories").find().sort({_id: -1}).toArray(function(err, results){
    if(!err){
      stepFoo(results);
    }
    else {
      stepFoo('error');
    }
  });
}
exports.setLogin = function (request, stepFoo)
{
  var postData = "";
  var postDadaObj = {};
  request.setEncoding("utf8");
  request.addListener("data", function(postDataChunk) {
                postData += postDataChunk;
  });
  request.addListener("end", function() {
    postData && postData.split('&').forEach(function( onePostData ) {
    var postParts = onePostData.split('=');
    postDadaObj[ postParts[ 0 ].trim() ] = ( postParts[ 1 ] || '' ).trim();
    });
    db.collection("users").findOne({name:postDadaObj.login}, function(err, results){
      if(err){
          console.log(err);
          stepFoo(0, 1);
      }
      else{
        if(results!==null){
          if(results.password==crypto.createHash('md5').update(postDadaObj.password).digest("hex")){
            var hash = crypto.createHash('md5')
                             .update("inva" + Math.round(new Date().getTime()) + results.name)
                             .digest("hex");
            db.collection("users").update({name:postDadaObj.login},{$set:{session_hash:hash}},
              {w:1}, 
              function(err, result){
                if(err){
                  console.log(err);
                  stepFoo(0, 1);
                }
                else{
                  stepFoo(hash, 0);  
                }
              }
            );
          }
          else{
            stepFoo(0, 1);  
          }
        }
        else{
          stepFoo(0, 1);  
        }
      }
    });
  });
}

loggedIn = function (request, stepFoo)
{
  var cookies = {};
  request.headers.cookie && request.headers.cookie.split(';').forEach(function( cookie ) {
    var parts = cookie.split('=');
    cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
  });
  db.collection("users").findOne({session_hash:cookies.INSSID}, function(err, results){
    if(!err){
      if(results!==null)
      {
        var userObj = {name:results.name, level:results.level, penname:results.penname}
        stepFoo(true, userObj);           
      }
      else{
        stepFoo(false, null);
      }
    }
    else{
      stepFoo(false, null);
      console.log(err);
    }
  });
}
exports.loggedIn = loggedIn;

exports.getMainMenu = function (fname, type, stepFoo)
{
  db.collection("pages").find({published:1}).toArray(function(err, results){
    if(!err){
      if(type=="list"){
          stepFoo(results);
      }
      else if(type=="html"){
        var menuOut ='<ul><li><a';
        if(fname==="") {menuOut +=' class="active"';}
        menuOut +=' href="' + options.vars.siteUrl + 
                  '" alias="" page-alias="" page-type="index" page-title="' + 
                  options.vars.appName.replaceAll('["]', "\\'") + '">Home</a></li>';
        results.forEach(function(result){
            if(result.type!="index")
            {    
              menuOut += '<li><a';
              if(fname==result.alias){menuOut +=' class="active"';}
              menuOut +=' href="' + options.vars.siteUrl+result.alias + '" alias="' + 
                        result.alias + '" page-alias="' + result.alias + 
                        '" page-type="pages" page-title="' + 
                        result.name.replaceAll('["]', "\\'") + '">' + 
                        result.name + '</a></li>';
            }
        });
        menuOut += '</ul>';
        stepFoo(menuOut);
      }
    }
    else{
        console.log(err);
        stepFoo("");
    }
  });
}