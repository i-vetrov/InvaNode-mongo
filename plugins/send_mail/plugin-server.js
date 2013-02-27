exports.execute = function (_in, data, message, stepFoo)
{
//    var data = JSON.parse(data);
//    var nodemailer = require("nodemailer");
//    var name = "hi" //data.name;
//    var text = "it" //data.text;
//    var email = "is" // data.email;
//    var smtpTransport = nodemailer.createTransport("SMTP",{
//        service: "Gmail",
//        auth: {
//            user: "i.vetrov@gmail.com",
//            pass: "wetrow85"
//        }
//    });
//    var d = new Date();
//    var mailOptions = {
//        from: "Ivan Vetrov <i.vetrov@gmail.com>", // sender address
//        to: "i.vetrau@invatechs.com", // list of receivers
//        subject: "MFS: "+d, // Subject line
//        text: "Message from siteform", // plaintext body
//        html: '<b>Message from siteform</b><br/><br/><b>Name: </b>'+name+'<br/><b>Email </b>'+email+'<br/><b>Text: </b>'+text+' '
//    }
//    smtpTransport.sendMail(mailOptions, function(error, resp){
//        if(error){
//            console.log(error);
//            stepFoo(message.error);          
//        }else{
//            stepFoo(message.done);
//        }
//        smtpTransport.close();
//     });
    
    _in.api("plugin", {alias:"social_buttons", call:data.call}, function(data){
        console.log(data)
        stepFoo("ok");
    }); 
}
