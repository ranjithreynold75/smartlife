var schedule=require('node-schedule');
var id=require('idgen');
var date=new Date(2017,2,16,13,15,0);
var m=require('mongodb');

var url="mongodb://jatters:alwaysforward1.@ds058579.mlab.com:58579/jatapp";
var mc=m.MongoClient;
var _db;
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
var rooms={
    detail:
    {

    }
}
var names={

    detail:{

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


        socket.on('register', function (data) {
            var d = JSON.parse(data);
            console.log("registering user " + d.id);
            users.user[d.no] = d.id;
            var phoneno=d.no;

            var h=_db.collection('house');
            h.find({"members.no":phoneno},{_id:1,"members.name":1}).forEach(function(dat){


                   console.log("user:"+dat._id);
                  room=dat._id;
                rooms.detail[phoneno]=room;
                names.detail[phoneno]=dat.name;
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

                io.sockets.in("room-"+rooms.detail[d.id]).emit('room_chat',{from:d.id,name:names.detail[d.id],message:d.message});


        });

        socket.on('disconnect', function () {
            console.log('A user disconnected ' + socket.id);

        })


    })


    //volley request

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
                                    }]
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


    io.to(users.user[house]).emit("notify", {message:"Gas leakage detected and prevented"});

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


        io.to(users.user[id]).emit("notify", {message:"NEED HELP URGENT "+id});
res.send("alert made");


    })
app.get("/house_hold",function (req,res) {
console.log("house_id:"+req.query.id);
    console.log("Tank:"+req.query.t);
    console.log("Dust:"+req.query.d);

res.send('{status:"N"}');
});
    





}