var express=require('express');
var app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
//var url="mongodb://@localhost:27017/jatapp";

var bodyparser=require('body-parser');


function notify(req,res,next){
console.log("request to "+req.url);
next();
}
app.use(bodyparser.urlencoded({extended:false}));
app.use(notify);
app.use(express.static(__dirname+'/profile'));



require('../router/route')(app,io);


/*
io.on("connection",function(socket){

    console.log("A user connected:"+socket.id);
    socket.emit('message',{'id':socket.id});



    socket.on('register',function(data){
        var d=JSON.parse(data);
        console.log("registering user "+d.id);
        users.user[d.no]=d.id;
        console.log(users);

    })




    socket.on('disconnect',function(){
        console.log('A user disconnected '+socket.id);
    })


})







*/




var server=http.listen(process.env.PORT || 8000,function(){
    console.log("server running in port 8000");
});

