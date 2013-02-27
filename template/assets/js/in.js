String.prototype.replaceAll=function(find, replace_to){
     return this.replace(new RegExp(find, "g"), replace_to);
};

function IN(){
    this.api = function(p1, p2, p3){
        var call, data, callback
        if(typeof p1 == 'undefined') {
            console.log("error in IN API call");
            return "error";
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
        if (typeof data == 'undefined') data = '{"default":"default"}';
        var dataStr = JSON.stringify(data);
        $.ajax({
        type: "POST",    
        url: "api",
        data: {call: call, data: dataStr},
        timeout: 3000,
        success: function(data){
                callback(data);
            },
        error: function(jqXHR, textStatus, errorThrown){
                callback("error");
                console.log("API error: " + textStatus + " " + errorThrown);
            }
        });
    }
  this.plugins = function(p1, p2, p3){
       
    }
}
var _in = new IN();