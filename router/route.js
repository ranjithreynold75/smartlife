var schedule=require('node-schedule');
var id=require('idgen');
var date=new Date(2017,2,16,13,15,0);
var m=require('mongodb');

var url="mongodb://jatters:alwaysforward1.@ds058579.mlab.com:58579/jatapp";
var mc=m.MongoClient;
var _db;


var multer=require("multer");
var upload=multer({dest:'/tmp/'});
var fs=require('fs');
var path1=require('path');


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

    },
    status:{

    }

};
var rooms={
    detail:
    {

    }
}
var names={

    detail:{

    }
}
var loc={
    detail: {

    }
}

var rule = new schedule.RecurrenceRule();
rule.minute = 5;

module.exports=function(app,io){

  /*  var j=schedule.scheduleJob(rule, function(){
       // io.sockets.emit("notify",{"message":"welcome to smartlife"});
         io.to(users.user['8754623583']).emit("notify", {message:"welcome to smarlife"});
        console.log("SEND notification "+Date.now());

    });

*/

    io.on("connection",function(socket) {

        console.log("A user connected:" + socket.id);
        socket.emit('message', {'id': socket.id});

        socket.on("location",function(data){
            var d=JSON.parse(data);
            var id=d.id;
            var longitude=d.longitude;
            var latitude=d.latitude;
           loc.detail[id]={
             longitude:longitude,
               latitude:latitude

           }
           console.log(loc);
         //  socket.emit("get_location",loc);
        })



   socket.on('rasp',function(data){

       io.sockets.in("room-"+8754623583).emit('notify',{"message":"fire detected:)"});


   })


        socket.on('register', function (data) {
            var d = JSON.parse(data);
            console.log("registering user " + d.id);
            users.user[d.no] = d.id;
            var phoneno=d.no;



            var db=_db.collection('smart_users');
            db.updateOne({_id:d.no},{$set:{status:"online"}});

            console.log("user status:"+users);

            var h=_db.collection('house');
            h.find({"members.no":phoneno},{_id:1}).forEach(function(dat){


                   console.log("user:"+dat._id);
                  room=dat._id;
                rooms.detail[phoneno]=room;

         socket.join("room-"+room);
              // io.sockets.in("room-"+room).emit('notify',{'message':phoneno+" is online"});

            })
            console.log(users);
                   //  io.sockets.emit("notify",{"message":"welcome to smartlife"});
        })

        socket.on("room_message",function(data){
           var d=JSON.parse(data);
            var msg=d.message;
            console.log("room message request by "+d.id+" message:"+d.message);

            var h=_db.collection('house');

                io.sockets.in("room-"+rooms.detail[d.id]).emit('room_chat',{from:d.id,message:d.message});


        });

        socket.on("p_chat",function(data){

            var d=JSON.parse(data);
            var from=d.from;
            var to1=d.t;
            var msg=d.m;

     console.log(d.from);

            if(users.status[to1]=="online")
            {
                var s=users.user[to1];
                console.log(s);
                io.to(s).emit("receive",{from:from,to:to1,message:msg});
            }
            else
            {
                var s=users.user[to1];

                console.log("offline");
                socket.emit("receive",{from:to1,to:from,message:"offline"});
               io.to(s).emit("chat_notify",{from:from,message:msg});

            }



        });
        
        
        socket.on('disconnect', function () {
            console.log('A user disconnected ' + socket.id);
            console.log(users);


        })


    });


    //volley request

    app.post("/user_status",function(req,res){

        var id=req.body.id;
        var status=req.body.status;

        users.status[id]=status;

        console.log(users);



    });



        app.post("/signup",function(req,res){

            //var house_id=id(8);
           //house_id=house_id.toUpperCase();
               console.log("A house signed up");
            var role=req.body.r;



if(role=="master") {
    var data = {
        _id: req.body.no,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        house_id: req.body.no
    };
}
else
{

    var data = {
        _id: req.body.no,
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        house_id: req.body.house_id
    };
}

                var h = _db.collection('smart_users');

                var cursor = h.find({_id: req.body.no});

                cursor.count(function (err, c) {
                    if (err)
                        console.log(err);

                    else {
                        if (c == 1) {
                            res.send("user already exist");
                        }
                        else {

                            var h = _db.collection('smart_users');
                            h.insertOne(data, function (err) {
                                if (err) {
                                    console.log(err);
                                    res.send("unsuccess");
                                }
                                else {
                                    console.log("Smart user registered succesfully");


                                    res.send("success");
                                }
                            });

                            if (role == "master") {

                                var h_data = {
                                    _id: req.body.no,
                                    name: req.body.name + " house",
                                    password: req.body.h,
                                    members: [{
                                        no: req.body.no,
                                        name: req.body.name
                                    }],
                                    door:"Y",
                                    tank_level:0,
                                    garbage_level:0

                                };
                                var h = _db.collection('house');
                                h.insertOne(h_data, function (err) {
                                    if (err) {
                                        console.log(err);
                                        //    res.send("unsuccess");
                                    }
                                    else {
                                        console.log("Smart house registered successfully");


                                        //res.send("success");
                                    }

                                });



                            }
                            else if (role == "member") {
                                var h = _db.collection('house');
                                var cursor = h.find({_id: req.body.house_id, password: req.body.h})

                                cursor.count(function (err, c) {

                                    if (c == 1) {

                                        var data = {
                                            no: req.body.no,
                                            name: req.body.name
                                        }
                                        h.updateOne({_id: req.body.house_id}, {$push: {members: data}});
                                        console.log("added to house member");
                                        //   res.send("success");
                                    }
                                    else if (c == 0) {
                                        console.log("invalid house password");
                                        // res.send("unsuccess");
                                    }


                                })
                            }

                        }


                    }


                })





        });


    app.post("/uploadimage",upload.single("avatar"),function(req,res){
        console.log("image uploaded");
        var id=req.body.id;


        //path1.join(__dirname,'../public','login.html')

    var filepath = path1.join(__dirname, id + ".jpg");
    console.log(filepath);
    fs.readFile(req.file.path, function (err, data) {
        if (err) {
            console.log(err);
            console.log("unsuccess read")
        }
        else {

            fs.writeFile(filepath, data, function (err) {
                if (err) {
                    console.log(err);

                    res.send("unsuccess write");
                }
                else {
                    console.log("image Stored successfully");
                    res.send("success");
                }
            });
        }
    });

    });


 /*
    var urlencoder=bodyparser.urlencoded({extended:false});
*/
    app.get("/get_image",function(req,res){
        var id=req.query.id;
        console.log(id+" get_image");
        fs.readFile(__dirname+"/"+id+".jpg",function(err,data){
            if(err) {
                console.log(err);
                res.send("unsuccess");
            }
            else
            {
                res.send(data);
            }

        });

    });




        app.post("/login",function(req,res){

            var phone=req.body.phone;
            var password=req.body.password;
if(phone!=''&&password!='') {
    var h = _db.collection("smart_users");
    var cursor = h.find({_id: phone, password: password});
    cursor.count(function (err, c) {
        if (err)
            console.log(err);
        else {
            if (c == 1) {
                console.log("login success "+phone);
                res.send("success");
            }
            else if(c==0)
            {
                res.send("unsuccess");
            }
        }
    })

}
else
{
    res.send("Invalid data");
}

        });





app.get("/gas_leakage",function(req,res){



    console.log("request made from arduino");
   // var h=_db.collection('');
    var house=req.query.id;
    var alert=req.query.al;
    console.log(house+" "+alert);

    var db=_db.collection("house");


    //io.to(users.user[house]).emit("notify", {message:"Gas leakage detected and prevented"});
    io.sockets.in("room-"+house).emit('notify',{"message":"Gas leakage detected and prevented"});

    var db=_db.collection("house");
    db.updateOne({_id:house},{$set:{door:"N"}});
    res.send('{status:"Y"}');


    //collection.find({_id:q_id},{_id:0,students:1}).toArray(function (err,d) {


});





app.get("/parking",function(req,res){

    var id=req.query.id;

    io.to(users.user[id]).emit("notify", {message:"NEED HELP URGENT"+id});
    res.send("Alert made");

})


app.get("/panic",function(req,res){
var id=req.query.id;


        //io.to(users.user[id]).emit("notify", {message:"NEED HELP URGENT "+id});
    io.sockets.in("room-"+req.query.id).emit('notify',{"message":"Panic state in house"});
    res.send("alert made");


    })
app.get("/house_hold",function (req,res) {
    console.log("house_id:"+req.query.id);
    console.log("Tank:"+req.query.t);
    console.log("Dust:"+req.query.d);
if(req.query.t<=3)
{
    io.sockets.in("room-"+rooms.detail[req.query.id]).emit('notify',{"message":"Tank is FULL"});

}
else if(req.query.t==8)
{
    io.sockets.in("room-"+rooms.detail[req.query.id]).emit('notify',{"message":"Tank water level is low->need to refill"});

}
    if(req.query.d<=3)
    {
        io.sockets.in("room-"+rooms.detail[req.query.id]).emit('notify',{"message":"DUSTBIN is FULL"});

    }

var db=_db.collection("house");
    var dval=((15-req.query.d/15)*100);
var tval=((6-req.query.d/6)*100);
    db.updateOne({_id:req.query.id},{$set:{tank_level:tval,garbage_level:dval}});


    res.send('{status:"Y"}');
});
    

app.get("/door",function(req,res){

    var id=req.query.id;

    var h=_db.collection("house");
    h.find({_id:id}).forEach(function(x){
         var status=x.door;
console.log(status);
        res.send({status:status});

    })




})

    app.post("/get_door",function(req,res){
        var id=req.body.id;
        console.log(id);

        var h=_db.collection("house");
        h.find({"members.no":id},{door:1}).forEach(function (x) {
            res.send(x.door);
        })

    })


    app.post("/door_change",function(req,res){

        var h_id=req.body.h;
        var pass=req.body.pass;
        var st=req.body.st;
        var h=_db.collection("house");
    var cursor=h.find({_id:h_id,password:pass});
        cursor.count(function(err,c){
            if(c==1)
            {
             if(st=="on")
             {
                 var d=_db.collection("house");
                 d.updateOne({_id:h_id},{$set:{door:"Y"}});
                 res.send("Door lock active");
             }

               else if(st=="off")
                {
                    var d=_db.collection("house");
                    d.updateOne({_id:h_id},{$set:{door:"N"}});
                res.send("Door lock Deactivated");
                }
            }
        })



    })


    app.get("/door_alert",function(req,res){

        var id=req.query.id;

        io.sockets.in("room-"+rooms.detail[id]).emit('notify',{"message":"Door Lock breach!! ALERT"});



    })

    app.post("/get_family",function (req,res) {
     var id=req.body.id;
        var db=_db.collection("house");

db.find({"members.no":id},{_id:0,members:1}).forEach(function(x){

    console.log(JSON.stringify(x));
    res.send(JSON.stringify(x));
})
    //collection.aggregate({$unwind:"$students"},{$match:{_id:q_id,"students.access":'no'}},{$project:{_id:0,students:1}},function (err,data) {

    });


app.post("/get_tank",function(req,res) {
   var id = req.body.name;
    //var db = _db.collection("house");
   // db.find({"members.no": id}).forEach(function (x) {

     //   res.send({tank:x.tank_level});
    //})
    console.log(id);
    fs.readFile(__dirname+"/"+id+".jpg",function(err,data){
        if(err) {
            console.log(err);
            res.send("unsuccess");
        }
        else
        {
            res.send(data);
        }
    });


})


    app.post("/get_garbage",function(req,res){
        var id=req.body.id;
        var db=_db.collection("house");
        db.find({"members.no":id}).forEach(function(x){

            res.send({garbage:x.garbage_level});
        })


})






}