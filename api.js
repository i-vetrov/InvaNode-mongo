getEntityByAlias = function(data, db, plugins, stepFoo){
    try{
        var dataObj = JSON.parse(data);
        db.getRegularEntityByAlias(dataObj.alias, "/", function(result){
           if(result !== undefined){
                if(result.code !== undefined){
                    stepFoo("error"); 
                }
                else{
                    plugins.fire(result.smalldata, dataObj.type, function(smalldata){
                        result.smalldata = smalldata;
                        plugins.fire(result.data, dataObj.type, function(bigdata){
                        result.data = bigdata;
                        stepFoo(result);
                        });
                    });
                }
            }
            else{
                stepFoo("error");    
            }
        });
    }    
    catch (e){
        console.log(e);
        stepFoo("error");
    } 
}
exports.getEntityByAlias = getEntityByAlias;

getEntityById = function(data, db, plugins, stepFoo){
    try{ 
        var dataObj = JSON.parse(data);
        db.getRegularEntityById(dataObj.id, dataObj.type, function(result){
            if(result !== undefined){
                if(result.code !== undefined){
                    stepFoo("error"); 
                }
                else{
                    plugins.fire(result.smalldata, dataObj.type, function(smalldata){
                        result.smalldata = smalldata;
                        plugins.fire(result.data, dataObj.type, function(bigdata){
                        result.data = bigdata;
                        stepFoo(result);
                        });
                    });
                }
            }
            else{
                stepFoo("error");    
            }
        });
    }    
    catch (e){
        console.log(e);
        stepFoo("error");
    } 
}
exports.getEntityById = getEntityById;

getLatestPosts = function(data, db, plugins, stepFoo){
    try{ 
        var dataObj = JSON.parse(data);
        db.getLatestPosts(function(results){
            var out =[];
            var max = (parseInt(dataObj.count)<(results.length))? parseInt(dataObj.count) : results.length; 
            while (max--){
                out[max] = results[max];  
            }
            plugins.fire(JSON.stringify(out), "posts", function(data){
                stepFoo(data);
            });
        });
    }    
    catch (e){
        console.log(e);
        stepFoo("error");
    }    
}
exports.getLatestPosts = getLatestPosts;

getAllPages = function(request, db, plugins, stepFoo){
    db.getMainMenu("", "list" ,function(results){
        plugins.fire(JSON.stringify(results), "pages", function(data){
                    stepFoo(data);
        });
    });
}
exports.getAllPages = getAllPages;

getTemplate = function(data, template, plugins, stepFoo){
    try{    
        var dataObj = JSON.parse(data);
        var list = ['page','post','small_post','footer','header','index']
        if(list.indexOf(dataObj.name) != -1){
            plugins.fire(template[dataObj.name], dataObj.name, function(data){
                        stepFoo(data);
            });
        }
        else{
            stepFoo("error");
        }
    }    
    catch (e){
        console.log(e);
        stepFoo("error");
    }
}
exports.getTemplate = getTemplate;

getPageType = function(data, db, stepFoo)
{
    try{
        var dataObj = JSON.parse(data);
        db.getRegularEntityByAlias(dataObj.alias, "/", function(result){
                    if(result == undefined){
                        if(dataObj.alias == "") {
                            result = {type:"index"};
                        }
                        else{
                            result = {type:"error"};
                        }
                    }
                    stepFoo(result.type);
        });
    }
    catch (e){
        console.log(e);
        stepFoo("error");
    }
}
exports.getPageType = getPageType;

getIndex = function(db, plugins, stepFoo)
{
    db.getIndexContent(function(result){
        var res = JSON.stringify(result);
        plugins.fire(res, "index", function(data){
             stepFoo(data);
        });
    });
         
}
exports.getIndex = getIndex;

loadDashboard = function(db, stepFoo)
{
    var dashBoard = {
        indexType: '',
        indexName: '',
        indexPageAlias: ''
    };
    
    
    db.getIndexContent(function(result){
        if(result[0].type=="index") {
           dashBoard.indexType = 'page';
           dashBoard.indexName = result[0].name;
           dashBoard.indexPageAlias = result[0].alias;
        }
        else if(result[0].type=="posts")
        {
           dashBoard.indexType = '$list_of_posts';
           dashBoard.indexName = "<b>Basic:</b> Latest posts";
           dashBoard.indexPageAlias = "$list_of_posts";
        }
        
        
        stepFoo(dashBoard);
    });
         
}
exports.loadDashboard = loadDashboard;

setIndex = function (request, data, db, stepFoo)
{
    try{
        var dataObj = JSON.parse(data);
        db.setIndexContent(request, dataObj, function(data){
            stepFoo(data);
        });
    }
    catch(e){
        console.log(e);
        stepFoo('error');
    }
}
exports.setIndex = setIndex;

textApi = function(db, template, request, plugins){
    var ret = {api: function(p1, p2, p3){
        var call, data, callback
        if(typeof p1 == 'undefined') {
            if(typeof p2 == 'function'){
                p2("error")
            }
            else if(typeof p3 == 'function'){
                p3("error");
            }
        }
        else{
            call = p1;
        }
        if(typeof p2 == 'undefined') {
            data = 'default';
        }
        else if(typeof p2 == 'function'){
            callback = p2;
        }
        else{
            data = p2;
        }
        if(typeof p3 == 'function'){
            callback = p3;
        }
        if (typeof data == 'undefined') {
            var dataStr = '{"default":"default"}';
        }
        else{
            var dataStr = JSON.stringify(data);
        }
        switch(call){
            case "is_logged_in":db.loggedIn(request, function(check, userObj){
                                    if(check){
                                        callback('{logged:"true","name":"'+userObj.name+'","level":"'+userObj.level+'"}');
                                    }
                                    else{
                                        callback("false") 
                                    }
                                });
                            break;
            case "get_entity_by_alias":getEntityByAlias(dataStr, db, plugins, function(data){
                                            callback(data);
                                       });
                            break;
            case "get_entity_by_id":getEntityById(dataStr, db, plugins, function(data){
                                            callback(data);
                                       });
                            break;
            case "get_latest_posts":getLatestPosts(dataStr, db, plugins, function(data){
                                            callback(data);
                                       });
                            break;
            case "get_all_pages":getAllPages(db, plugins, function(data){
                                            callback(data);
                                       });
                            break;
            case "get_page_type":getPageType(dataStr, db, function(data){
                                            callback(data);
                                       });
                            break;
            case "get_template":getTemplate(dataStr, template, plugins, function(data){
                                            callback(data);
                                       });
                            break;
            case "get_index":getIndex(db, plugins, function(data){
                                            callback(data);
                             });            
                            break;
            case "plugin":  var _in = textApi(db, template, request, plugins);
                                            plugins.serverExecute(_in, dataStr, callback);
                            break;                
            default: callback("error");
                break;
        } 
    }
  }
  return ret;
}
exports.textApi = textApi;