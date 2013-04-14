function getLocalImages() {
    _in.api("get_local_images", function(data){
        var out = "";
        if(data=="error"){
            out = "Error loading files";
        }
        else
        {    
        data = $.parseJSON(data);
        var i = data.length;
         while(i--)
             {
                if(data[i].split('.')[data[i].split('.').length-1]!='txt')
                out +=  '<div style="float:left; padding: 6px; border: 1px solid #ccc; margin:0 10px 10px 0; cursor:pointer;" onclick="insertLocalImage(\''+data[i]+'\')"><img style="height: 100px; width: auto;" src="/images/'+encodeURI(data[i])+'" /></div>'
               
             }
         out +=  '<div style="float:left; height: 100px; width: 100px; text-align: center; padding: 6px; border: 1px solid #ccc; margin:0 10px 10px 0; cursor:pointer; position:relative;">'+
                 '<input type="file" name="fileBox" id="fileBox" style="opacity: 0; position: absolute; top:0; left:0; width:100%; height:100%; cursor:pointer;" onchange="addNewImage(event)">'+
                 '<span style="font-size: 94px;line-height: 99px; color:#08c;" id="image-load-loader-place">\+</span></div>'    
        $("#local-images-holder").html(out);
        }  
    });
}

function insertLocalImage(fileName) {
    $("#local-image-url").val("http://"+location.host+'/images/'+encodeURI(fileName));
}

function addNewImage(event) {
  $("#image-load-loader-place").html('<img src="/template/assets/img/loading.gif" width: 40px; height: 40px; />');  
  var SelectedFile = event.target.files[0];
  Name = SelectedFile.name;
  Size = SelectedFile.size;
  FReader = new FileReader();   
  FReader.onload = function(evn){  
            _in.api("upload_image_file",{'filedata':evn.target.result, 'name':Name, 'size':Size},function(data){
                    if(data=="error"){alert("somthing went wrong!"); getLocalImages();}
                    else{
                        getLocalImages();
                    }
    });
  }
  FReader.readAsDataURL(SelectedFile);
}

function loadAll(type) {   
  if(type=="dashboard")
      {
          loadDashboard();
          return;
      }

  if(type=="plugins")
      {
          loadPluginsAdmin();
          return;
      }
  var todo='load_all_'+type;
  _in.api(todo, function(data){
      if(data == 'error'){
        $("#main_canv").html(data);
        return;
      }
      var toHtml;
      data = $.parseJSON(data);
      if(type!="templates" && type!="users" && type!="categories"){
          toHtml ='<h3 style="float: left; margin-right: 40px;">'+type.charAt(0).toUpperCase()+type.slice(1)+'</h3><div style="margin-top: 15px;"><a class="btn btn-primary" href="#" onclick="addNew(\''+type+'\');return false;"><i class="icon-pencil icon-white"></i> Add new</a></div>';
          toHtml +='<div class="span15">';
          toHtml +='<div class="span1" style="min-height:50px; width: 20px;"><h4>ID</h4></div><div class="span4"><h4>Name</h4></div><div class="span2"><h4>Author</h4></div><div class="span2"><h4>Published</h4></div><div class="span3"><h4>Options</h4></div>';
          toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          data.forEach(function(line){
              var published;
              if(line.published == 0) published = '<span style="font-weight: bold;color: red">NO</span>'
              if(line.published == 1) published = '<span style="font-weight: bold;color: green">YES</span>'
              toHtml +='<div class="span1" style="min-height:50px; margin-top: 14px; width: 20px;">'+line.id+'</div><div class="span4" style="min-height:50px; margin-top: 14px;"><a href="{{SITE_URL}}'+line.alias+'" target="_blank">'+line.name+'</a></div>';
              toHtml +='<div class="span2" style="min-height: 50px;margin-top: 14px;">'+line.author+'</div>';
              toHtml +='<div class="span2" style="min-height: 50px;margin-top: 14px;">'+published+'</div>';
              toHtml +='<div class="span3">'+buttonsGroup(type, line.id)+'</div>';
              toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          });
          toHtml +='</div>';
      }
      else if(type == "categories"){
          toHtml ='<h3 style="float: left; margin-right: 40px;">'+type.charAt(0).toUpperCase()+type.slice(1)+'</h3><div style="margin-top: 15px;"><a class="btn btn-primary" href="#" onclick="addNew(\''+type+'\');return false;"><i class="icon-pencil icon-white"></i> Add new</a></div>';
          toHtml +='<div class="span15">';
          toHtml +='<div class="span1" style="min-height:50px; width: 20px;"><h4>ID</h4></div><div class="span2"><h4>Name</h4></div><div class="span3"><h4>Alias</h4></div><div class="span2"><h4>Parent</h4></div><div class="span1"><h4>On index</h4></div><div class="span1"><h4>In search</h4></div><div class="span2"><h4>Options</h4></div>';
          toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          data.forEach(function(line){
              var onindex;
              var searchable;
              if(line.onindex == 0) onindex = '<span style="font-weight: bold;color: red">NO</span>'
              if(line.onindex == 1) onindex = '<span style="font-weight: bold;color: green">YES</span>'
              if(line.searchable == 0) searchable = '<span style="font-weight: bold;color: red">NO</span>'
              if(line.searchable == 1) searchable = '<span style="font-weight: bold;color: green">YES</span>'
              toHtml +='<div class="span1" style="min-height:50px; margin-top: 14px; width: 20px;">'+line.id+'</div>';
              toHtml +='<div class="span2" style="min-height:50px; margin-top: 14px;"><a href="{{SITE_URL}}category/'+line.alias+'" target="_blank">'+line.name+'</a></div>';
              toHtml +='<div class="span3" style="min-height: 50px;margin-top: 14px;">'+line.alias+'</div>';
              toHtml +='<div class="span2" style="min-height: 50px;margin-top: 14px;">'+line.parent+'</div>';
              toHtml +='<div class="span1" style="min-height: 50px;margin-top: 14px;">'+onindex+'</div>';
              toHtml +='<div class="span1" style="min-height: 50px;margin-top: 14px;">'+searchable+'</div>';
              toHtml +='<div class="span2">'+buttonsGroup(type, line.id)+'</div>';
              toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          });
          toHtml +='</div>';
      }
      else if(type == "users"){
          toHtml ='<h3 style="float: left; margin-right: 40px;">'+type.charAt(0).toUpperCase()+type.slice(1)+'</h3><div style="margin-top: 15px;"><a class="btn btn-primary" href="#" onclick="addNew(\''+type+'\');return false;"><i class="icon-pencil icon-white"></i> Add new</a></div>';
          toHtml +='<div class="span15">';
          toHtml +='<div class="span1" style="min-height:50px;"><h4>ID</h4></div><div class="span3"><h4>Name</h4></div><div class="span3"><h4>Penname</h4></div><div class="span1"><h4>Level</h4></div><div class="span3"><h4>Options</h4></div>';
          toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          data.forEach(function(line){
              toHtml +='<div class="span1" style="min-height:50px; margin-top: 14px;">'+line.id+'</div><div class="span3" style="min-height:50px; margin-top: 14px;">'+line.name+'</div><div class="span3" style="min-height:50px; margin-top: 14px;">'+line.penname+'</div><div class="span1" style="min-height:50px; margin-top: 14px;">'+line.level+'</div><div class="span3">'+buttonsGroup(type, line.id)+'</div>';
              toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          });
          toHtml +='</div>';
      }
      else{
          toHtml ='<h3 style="float: left; margin-right: 40px;">'+type.charAt(0).toUpperCase()+type.slice(1)+'</h3><div></div>';
          toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
          var i = data.length;
          while(i--){
              toHtml +='<div class="span1" style="min-height:50px; margin-top: 14px;"></div><div class="span7" style="min-height:50px; margin-top: 14px;">'+data[i]+'</div><div class="span3">'+buttonsGroup(type, data[i])+'</div>';
              toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';  
          }  
      }
      $("#main_canv").html(toHtml);
  });
}

function buttonsGroup(type, id) {
  if(type=='users'){
      return '<div class="btn-toolbar"><div class="btn-group"><a class="btn btn-primary" href="#" onclick="editUser('+id+');return false;"><i class="icon-pencil icon-white"></i> Edit</a><a class="btn btn-danger" href="#" onclick="deletePPU(\''+type+'\', '+id+');return false;"><i class="icon-remove"></i></a></div></div>';
  }
  else if(type=='templates'){
      return '<div class="btn-toolbar"><div class="btn-group"><a class="btn" href="#" onclick="loadTemplateByAlias(\''+id+'\');return false;"><i class="icon-edit"></i></a></div></div>';
  }
  else{
      return '<div class="btn-toolbar"><div class="btn-group"><a class="btn" href="#" onclick="editPPU(\''+type+'\', '+id+');return false;"><i class="icon-edit"></i></a><a class="btn btn-danger" href="#" onclick="deletePPU(\''+type+'\', '+id+');return false;"><i class="icon-remove"></i></a></div></div>';
  }
}


function editUser(id) {   
  _in.api("load_all_users", function(data){
    data = JSON.parse(data);
    var level;
    data.forEach(function(d){
      if(d._id == id) level = d.level;
    })
    var type="users";
    var name ='User';
    var toHtml = '<div class="hero-unit"><div style="margin-bottom: 30px;"><h2 style="float: left; margin-right: 40px;">'+name+' editor</h2><div style="padding-top: 15px;"><a class="btn btn-primary" href="#" onclick="saveEdited(\''+type+'\', '+id+');return false;"><i class="icon-pencil icon-white"></i> Save</a><a style="margin-left: 10px;" class="btn btn-danger" href="#" onclick="loadAll(\''+type+'\');return false;"><i class="icon-remove icon-white"></i> Cancel</a></div></div>';  
        toHtml +='<div class="span10" style="margin-left: 0;"><h4 style="float: left; line-height: 10px; margin-right: 10px;">New password: </h4> <input type="text" class="span3" id="ent_password" /><span style="font-size:14px; color:#ccc;top: -6px;position: relative;left: 10px;">(Leave empty if you don\'t want to change password)</span></div>';
        toHtml +='<div style="clear:both;"></div>';
        toHtml +='<div class="span5" style="margin-left: 0;"><h4 style="float: left; line-height: 10px; margin-right: 10px;">Level: </h4>';
        toHtml +='<div class="input-append">'
        toHtml +='<div class="btn-group">';
        toHtml +='<input class="span2" style="color:#000; cursor:default; background-color: #fff;" id="appendedDropdownButton" type="text" value="'+level+'"></input>';
        toHtml +='<button class="btn dropdown-toggle" data-toggle="dropdown">';
        toHtml +='<span class="caret"></span>';
        toHtml +='</button>';
        toHtml +='<ul class="dropdown-menu">';
        toHtml +='<li><a onclick="setUserLevel(0);return false" href="#">0</a></li><li><a onclick="setUserLevel(1);return false" href="#">1</a></li><li><a onclick="setUserLevel(2);return false" href="#">2</a></li><li><a onclick="setUserLevel(3);return false" href="#">3</a></li><li><a onclick="setUserLevel(4);return false" href="#">4</a></li>';
        toHtml +='</ul>';
        toHtml +='</div>';
        toHtml +='</div>';
        $("#main_canv").html(toHtml);
  });
}
    
function loadTemplateByAlias(alias) {
  var type="templates";
  _in.api('load_all_templates', {alias:alias}, function(data){
      if(data == 'error'){
        $("#main_canv").html(data);
        return;
      }
      var toHtml;
      data = $.parseJSON(data);
      toHtml ='<h3 style="margin-right: 40px;cursor:pointer;" onclick="loadAll(\'templates\');">'+type.charAt(0).toUpperCase()+type.slice(1)+'</h3>';
      toHtml +='<h4 style="margin-top: 20px; float:left; margin-bottom:20px;">Template alias: "'+alias+'"</h4><div style="margin-top: 24px"><button class="btn btn-inverse" style="margin-left: 20px;" onclick="reloadTemplate(\''+alias+'\')" style="">Reload template</button></div>';
      toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';
      var i = data.length;
      while(i--){
        toHtml +='<div class="span1" style="min-height:50px; margin-top: 14px;"></div><div class="span7" style="min-height:50px; margin-top: 14px;">'+data[i]+'</div><div class="span3">';
        toHtml +='<div class="btn-toolbar"><div class="btn-group"><a class="btn" href="#" onclick="editTemplate(\''+alias+'\', \''+data[i]+'\');return false;"><i class="icon-edit"></i></a></div></div>';
        toHtml +='</div>';
        toHtml +='<div style="clear:both; border-top: 1px solid #DDD;"></div>';  
      }  
      $("#main_canv").html(toHtml);
  });
}
    
function editTemplate(alias, fName) {
 _in.api("process_template_data",{todo:"get",alias:alias,fname:fName,fdata:"null"},function(data){
    if(data!="error"){
      var toHtml = '';
      toHtml += '<div class="hero-unit"><div style="margin-bottom: 30px;">';
      toHtml +='<h4 style="margin-bottom: 20px;">template: "'+alias+'"</h4>';
      toHtml +='<h2 style="float: left; margin-right: 40px;">'+fName+'</h2><div style="padding-top: 15px;"><a class="btn btn-primary" href="#" onclick="saveTemplate(\''+alias+'\', \''+fName+'\');return false;"><i class="icon-pencil icon-white"></i> Save</a><a style="margin-left: 10px;" class="btn btn-danger" href="#" onclick="loadTemplateByAlias(\''+alias+'\');return false;"><i class="icon-remove icon-white"></i> Cancel</a></div></div>';

      toHtml +='<textarea style="width: 810px; height: 650px; background-color: #fff;" id="editor"></textarea>';

      toHtml +='</div>';
      $("#main_canv").html(toHtml);
      $('#editor').val(data);
      myCodeMirror = CodeMirror.fromTextArea(editor);
    }
    else{
        bootbox.alert("Error loading file "+fName);
    }
});
}

function saveTemplate(alias, fName) {
  myCodeMirror.save();
  var fdata = $('#editor').val();
   _in.api("process_template_data",{todo:"save",alias:alias, fname:fName,fdata:fdata},function(data){
    if(data!="error"){
       bootbox.alert("File <b>"+fName+"</b> from <b>"+alias+"</b> theme saved!", function(){loadAll("templates");});
      }
    else{
        bootbox.alert("Error saving file "+fName);
    }
  });
}

function PPESetTemplate(tpl) {
  $("#appendedDropdownButtonTemplate").val(tpl);
}

function setUserLevel(lvl) {
  $("#appendedDropdownButton").val(lvl);
}

function trackAlias() {
  var str = $("#ent_name").val();
  $("#ent_alias").val(str.toLowerCase().replace(new RegExp(" ", "g"), "_"));
}

function trackCatAlias() {
  var str = $("#cat-name").val();
  $("#cat-alias").val(str.toLowerCase().replace(new RegExp(" ", "g"), "_"));
}
function deletePPU(type, id) {
  bootbox.confirm("Do you realy want to delete?", function(confirm){
      if(confirm){
          var todo='delete';
          _in.api("post_page_editing", {todo:todo, type:type, id:id}, function(data){
            bootbox.alert(data, function() {
                  if(data == "done"){
                      loadAll(type);
                  }
              });
          });
      }    
  });
}

function editPPU(type, id) {   
  var todo='opendata';
  _in.api("post_page_editing", {todo:todo, type:type, id:id}, function(data){
         if(type=="categories"){
             openCatEditor(data, id);
         }    
         else {
             openEditor(data, type, id);
         }    
  });
}

function openCatEditor(data, id) {
  data = $.parseJSON(data);
  _in.api("get_categories", function(catData){
      catData = $.parseJSON(catData);
      var catList = '';
      var curParent = {name:"null",alias:"null"}; 
      catData.forEach(function(cat){
          catList += '<li><a onclick="catEditorSetParent(\''+cat.alias+'\', \''+cat.name+'\');return false;" href="#">'+cat.name+'</a></li>';
          if(data[0].parent == cat.alias){
              curParent.name = cat.name;
              curParent.alias = cat.alias;
          }
      });
      catList += '<li><a onclick="catEditorSetParent(\'null\',\'null\');return false;" href="#">null</a></li>';
      var name = 'Edit category';
      var onindex = '';
      if(data[0].onindex == 1){
          onindex = 'checked="checked"'
      }
      var searchable = '';
      if(data[0].searchable == 1){
          searchable = 'checked="checked"'
      }
      var toHtml = '<div class="hero-unit"><div style="margin-bottom: 30px;"><h2 style="float: left; margin-right: 40px;">'+name+'</h2><div style="padding-top: 15px;"><a class="btn btn-primary" href="#" onclick="saveEdited(\'categories\', '+id+');return false;"><i class="icon-pencil icon-white"></i> Save</a><a style="margin-left: 10px;" class="btn btn-danger" href="#" onclick="loadAll(\'categories\');return false;"><i class="icon-remove icon-white"></i> Cancel</a></div></div>';
          toHtml +='<div style="font-size: 14px;">';
          toHtml +='<div style="margin-top: 10px;"><div style="float:left;width: 130px;"><h4>Name:</h4></div><div><span style="font-weight: bold;">'+data[0].name+'</span></div></div>';
          toHtml +='<div style="margin-top: 10px;"><div style="float:left;width: 130px;"><h4>Alias:</h4></div><div><span style="font-weight: bold;">'+data[0].alias+'</span></div></div>';
          toHtml +='<div style="margin-top: 10px;"><div style="float:left;width: 130px;"><h4>On Index:</h4></div><div><input id="cat-onindex" '+onindex+' type="checkbox" /></div></div>';
          toHtml +='<div style="margin-top: 10px;"><div style="float:left;width: 130px;"><h4>Searchable:</h4></div><div><input id="cat-searchable" '+searchable+' type="checkbox" /></div></div>';
          toHtml +='<div style="margin-top: 10px;"><div style="float:left; width: 130px;"><h4>Parent:</h4><br /></div>'
          toHtml +='<div class="input-append">'
          toHtml +='<div class="btn-group">';
          toHtml +='<input class="span4" style="color:#000; cursor:default; background-color: #fff;" alias-val="'+curParent.alias+'" id="appendedDropdownButton" type="text" value="'+curParent.name+'"></input>';
          toHtml +='<button class="btn dropdown-toggle" data-toggle="dropdown">';
          toHtml +='<span class="caret"></span>';
          toHtml +='</button>';
          toHtml +='<ul class="dropdown-menu">';
          toHtml +=catList;
          toHtml +='</ul>';
          toHtml +='</div>';
          toHtml +='</div><span style="margin: -3px 0 0 10px;">(null for root)</span></div>';
          toHtml +='</div>';
          toHtml +='</div>';
          $("#main_canv").html(toHtml);
  });
}

function catEditorSetParent(alias, name) {
  $("#appendedDropdownButton").val(name);
  $("#appendedDropdownButton").attr("alias-val",alias);
}

function reloadTemplate(alias) {
  _in.api('reload_template_immediate', {alias:alias},function(data){
     bootbox.alert(data); 
  });
}

var plugins;

function loadPluginsAdmin() {
  _in.api("load_plugins_admin", function(data){
      if(data == "error") {
          bootbox.alert(data);
      }
      else{
          plugins = JSON.parse(data);
          var  toHtml ='<h3 style="float: left; margin-right: 40px;">Plugins</h3><div style="margin-top: 15px;"></div><button class="btn btn-inverse" onclick="reloadPlugins()" style="">Reload Plugins</button>';
          toHtml += '<table class="table"><thead><tr><th>Name</th><th>Author</th><th>Replace</th><th>Source</th><th></th></tr></thead><tbody>';
          plugins.plugin.forEach(function(plugin){
               toHtml += '<tr><td>'+ plugin.name +'</td><td>'+ plugin.author +'</td><td>'+ plugin.content.replace +'</td><td>'+ plugin.content.source +'</td><td><a class="btn" href="#" onclick="showPluginContent(\''+plugin.alias+'\');return false;"><i class="icon-edit"></i></a></td></tr>';
          });
          toHtml += '</tbody></table>';
          $("#main_canv").html(toHtml);
      }
  });
}

function showPluginContent(alias) {
  if(plugins === undefined)
  {
          _in.api("load_plugins_admin", function(data){
                  if(data == "error") {
                      bootbox.alert(data);
                  }
                  else{
                      plugins = JSON.parse(data);
                      showPluginContentProc(alias);
                  }
          });
  }
  else
  {
      showPluginContentProc(alias);
  }
}

function  showPluginContentProc(alias) {
  var curP;
  plugins.plugin.forEach(function(plugin){
              if(plugin.alias == alias) curP = plugin;
          });
  var  toHtml ='<div class="hero-unit"><h3 style="float: left; margin-right: 40px;">Plugin: <span style="font-size: 24px; font-weight: normal;">' + curP.name + '</span></h3> <div style="padding-top: 15px;"><a class="btn btn-primary" href="#" onclick="savePlugin(\'' + alias + '\');return false;"><i class="icon-pencil icon-white"></i> Save</a><a style="margin-left: 10px;" class="btn btn-danger" href="#" onclick="loadAll(\'plugins\');return false;"><i class="icon-remove icon-white"></i> Cancel</a></div>';
  toHtml +='<div class="span11" style="margin-left:0;"><h4 style="min-width: 110px;float: left; line-height: 10px; margin-right: 17px;">Name: </h4> <input type="text" value="'+curP.name+'" class="span8" id="plugin_name" /></div>';
  toHtml +='<div class="span11" style="margin-left:0;"><h4 style="min-width: 110px;float: left; line-height: 10px; margin-right: 17px;">Author: </h4> <input type="text" value="'+curP.author+'" class="span8" id="plugin_author" /></div>';
  toHtml +='<div class="span11" style="margin-left:0;"><h4 style="min-width: 110px;float: left; line-height: 10px; margin-right: 17px;">Description: </h4> <input type="text" value="'+curP.description+'" class="span8" id="plugin_description" /></div>';
  toHtml +='<div class="span11" style="margin-left:0;"><h4 style="min-width: 110px;float: left; line-height: 10px; margin-right: 17px;">Replace: </h4> <input type="text" value="'+curP.content.replace+'" class="span8" id="plugin_content_replace" /></div>';
  toHtml +='<div class="span11" style="margin-left:0;"><h4 style="min-width: 110px;float: left; line-height: 10px; margin-right: 17px;">Code: </h4> <textarea style="height: 500px;  background-color: #fff;" class="span8" id="plugin_content_source" ></textarea></div>';
  toHtml +='<div class="span11" style="margin-left:0;"><h4 style="min-width: 110px;float: left; line-height: 10px; margin-right: 17px;">Apply to: </h4>';
  var applPossible=['index','pages','posts','search'];
  applPossible.forEach(function(appl){
      var ch = curP.applyTo.indexOf(appl) != -1 ? 'checked="checked"' : ''; 
      toHtml +='<label class="checkbox" style="float:left; margin-right: 15px; padding-top: 7px;"><input ' + ch + ' id="chbox_'+ appl +'" type="checkbox"> '+ appl +'</label>';
  });
  toHtml +='<span style="color:#999; font-size: 15px;">(Don\'t forget to put "replacer" to the conforming template)</span></div>';
  toHtml +='<div style="clear:both;"></div></div>';
  $("#main_canv").html(toHtml);
  $('#plugin_content_source').val(curP.content.replaceWith);
  myCodeMirror = CodeMirror.fromTextArea(plugin_content_source);
  $(".CodeMirror").css('font-size','14px');
}

function savePlugin(alias) {
  var name = $("#plugin_name").val();
  var author = $("#plugin_author").val(); 
  var description = $("#plugin_description").val();
  var replace = $("#plugin_content_replace").val();
  myCodeMirror.save();
  var replacewith = $("#plugin_content_source").val();
  var applyto = "";
  if($("#chbox_index").is(":checked")) applyto += "index";
  if($("#chbox_pages").is(":checked")) applyto += ",pages";
  if($("#chbox_posts").is(":checked")) applyto += ",posts";
  if($("#chbox_search").is(":checked")) applyto += ",search";
  _in.api("save_plugin", {name:name,alias:alias, author:author, description:description, replace:replace, replacewith:replacewith, applyto:applyto}, function(data){
      bootbox.alert(data, function() {
          if(data == "done"){
              loadAll("plugins");
          }
      });
  });
}

function reloadPlugins() {
  _in.api('reload_plugins',function(data){
     bootbox.alert(data); 
  });
}

function loadDashboard() {
  _in.api("load_dashboard", function(data){
      if(data == "error"){
        $("#main_canv").html(data);
        return;
      }
      data = $.parseJSON(data);
      _in.api("load_all_pages", function(pages){
          var options = '<li><a onclick="preSetOption(\'index_page\', \'$list_of_posts\', \'<b>Basic:</b> Latest posts</a>\'); return false;" href="#"><b>Basic:</b> Latest posts</a></li>';
          pages = $.parseJSON(pages);
          var i = pages.length;
          while(i--){
              options += '<li><a onclick="preSetOption(\'index_page\', \''+pages[i].alias+'\', \''+pages[i].name+'\'); return false;" href="#">'+pages[i].name+'</a></li>';
          }    
          var  toHtml ='<div class="hero-unit"><h3 style="float: left; margin-right: 40px;">Dashboard</h3>';
          toHtml +='<div style="clear:both;"></div>';
          toHtml += '<div style="width: 461px;font-size: 15px;"><table class="table"><thead><tr><th>Statistics</th><th>#</th></tr></thead>' +
                     '<tbody><tr><td>Number of Pages</td><td>{{NUMBER_OF_PAGES}}</td></tr><tr><td>Number of Posts'+
                     '</td><td>{{NUMBER_OF_POSTS}}</td></tr><tr><td>Number of Users</td><td>{{NUMBER_OF_USERS}}'+
                     '</td></tr><tr><td></td><td></td></tr></tbody></table></div>';
          toHtml +='<div class="span10" style="margin-left: 10px;">';
          toHtml +='<div class="input-append">';
          toHtml +='<label style="float:left; padding-top: 5px; margin-right: 40px;" class="control-label" for="appendedDropdownButton">Index content: </label>';
          toHtml +='<span class="input-xlarge uneditable-input" style="color:#000; cursor:default; background-color: #fff;" readonly="readonly" id="appendedDropdownButton" type="text">'+data.indexName+'</span>';
          toHtml +='<div class="btn-group">';
          toHtml +='<button class="btn dropdown-toggle" data-toggle="dropdown">';
          toHtml +='<span class="caret"></span>';
          toHtml +='</button>';
          toHtml +='<ul class="dropdown-menu" style="left: -131px;">';
          toHtml +=options;
          toHtml +='</ul>';
          toHtml +='</div>';
          toHtml +='</div>';
          toHtml +='<button onclick="saveState(\'index_page\')" id="indexSaver" class="btn btn-inverse" style="display: none; margin-left: 10px; vertical-align:top;" data-toggle="dropdown">';
          toHtml +='Save';
          toHtml +='</button>';
          toHtml += '</div>';
          $("#main_canv").html(toHtml.replaceAll("{{NUMBER_OF_PAGES}}", data.stats.pages_num)
                    .replaceAll("{{NUMBER_OF_POSTS}}", data.stats.posts_num)
                    .replaceAll("{{NUMBER_OF_USERS}}", data.stats.users_num));
      });
  });
}

var preSetState = {
  index_page:null
};

function preSetOption(state, value, UI) {
  preSetState[state] = value;
  $("#indexSaver").css("display","inline-block");
  $("#appendedDropdownButton").html(UI);
}

function saveState(state) {
  switch(state){
    case "index_page":
      _in.api("set_index",{set:preSetState[state]}, function(data){
              bootbox.alert(data, function() {
              if(data == "done"){
                  $("#indexSaver").css("display","none");
              }
          });
      });
      break;
  }
}