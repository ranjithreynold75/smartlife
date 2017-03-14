var express=require('express');
var app=express();
var http=require('http').Server(app);
var m=require('mongodb');
var io=require('socket.io')(http);
//var url="mongodb://@localhost:27017/jatapp";
var url="mongodb://jatters:alwaysforward1.@ds058579.mlab.com:58579/jatapp";
var mc=m.MongoClient;
var _db;
var bodyparser=require('body-parser')
mc.connect(url,function(err,db){
    if(err)
    {
        console.log(err);
    }
    else
    {
        _db=db;
    }
});


var users={
    user:{

    }

};
function notify(req,res,next){
console.log("request to "+req.url);
next();
}

app.use(notify);
app.use(bodyparser.urlencoded({extended:false}));


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







require('../router/route')(app,io,_db);





var server=http.listen(process.env.PORT || 8000,function(){
    console.log("server running in port 8000");
});

