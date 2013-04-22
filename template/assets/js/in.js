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
        jQuery.ajax({
        type: "POST",    
        url: "/api",
        data: {call: call, data: dataStr},
        timeout: 20000,
        success: function(data){
                callback(data);
            },
        error: function(jqXHR, textStatus, errorThrown){
                callback("error");
                console.log("API error: " + textStatus + " " + errorThrown);
            }
        });
    }
    this.buildRoutingGraph = function (type, id, alias, category, date)
    {
        var monthnum = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
        var url = routingGraph.replaceAll(":category", category)
                    .replaceAll(":alias", alias)
                    .replaceAll(":id", id)
                    .replaceAll(":year", new Date(date*1000).getUTCFullYear())
                    .replaceAll(":monthnum", monthnum[new Date(date*1000).getUTCMonth()])
                    .replaceAll(":day", new Date(date*1000).getUTCDate());
        return url;            
    }
  this.plugins = function(p1, p2, p3){
       
    }
}
var _in = new IN();