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

var rule = new schedule.RecurrenceRule();
rule.minute = 5;

module.exports=function(app,io){

    var j=schedule.scheduleJob(rule, function(){
       // io.sockets.emit("notify",{"message":"welcome to smartlife"});
         io.to(users.user['8754623583']).emit("notify", {message:"welcome to smarlife"});
        console.log("SEND notification "+Date.now());

    });



    io.on("connection",function(socket) {

        console.log("A user connected:" + socket.id + " " + date);
        socket.emit('message', {'id': socket.id});


        socket.on('register', function (data) {
            var d = JSON.parse(data);
            console.log("registering user " + d.id);
            users.user[d.no] = d.id;
            console.log(users);
            //         io.sockets.emit("notify",{"message":"welcome to smartlife"});
        })


        socket.on('disconnect', function () {
            console.log('A user disconnected ' + socket.id);

        })


    })


    //volley request

        app.post("/house_signup",function(req,res){

            var house_id=id(8);
           house_id=house_id.toUpperCase();
               console.log("A house signed up");
            var role=req.body.r;
            var data={
                 _id:req.body.phone,
             name:req.body.name,
                 email:req.body.email,
                 password:req.body.password,
                 no_of_members:req.body.no,
                 house_id:house_id
             };

var h=_db.collection('smart_users');
            h.insertOne(data,function(err){
                if(err) {
                    console.log(err);
                res.send("unsuccess");
                }
                else {
                    console.log("Smart user registered succesfully");

                    if(role=="master")
                    {
                        h=_db.collection('house');
                        h.insertOne({_id:req.body.phone,member:[{name:req.body.name,phone:req.body.phone,longitude:0,latitude:0}]});

                    }
                res.send("success");
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
                console.log("login success");
                res.send("success");
            }
            else {
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





app.get("/gasleakage",function(req,res){
    console.log("request made from arduino");
   // var h=_db.collection('');
    var house=req.query.id;
    var alert=req.query.al;
    console.log(house+" "+alert);

res.send("Alert made");

    io.to(users.user[house]).emit("notify", {message:"Gas leakage detected and prevented"});

    //collection.find({_id:q_id},{_id:0,students:1}).toArray(function (err,d) {


})


    app.post("/addfamily",function(req,res){

        var house=req.body.id;
        var member=req.body.m;
        var name=req.body.name;

        data={
            member:member,
            name:name
        }
var h=_db.collection('house');



    })





}