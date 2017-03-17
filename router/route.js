var schedule=require('node-schedule');

var date=new Date(2017,2,16,13,15,0);

var users={
    user:{

    }

};

var rule = new schedule.RecurrenceRule();
rule.second = 5;

module.exports=function(app,io){

    var j=schedule.scheduleJob(rule, function(){
        io.sockets.emit("notify",{"message":"welcome to smartlife"});
        // io.to(users.user['8754623583']).emit("notify", {message:"welcome to smarlife"});
        console.log("SEND notification "+date);

    });



    io.on("connection",function(socket){

        console.log("A user connected:"+socket.id+" "+date);
        socket.emit('message',{'id':socket.id});



        socket.on('register',function(data){
            var d=JSON.parse(data);
            console.log("registering user "+d.id);
            users.user[d.no]=d.id;
            console.log(users);
   //         io.sockets.emit("notify",{"message":"welcome to smartlife"});
        })



        socket.on('disconnect',function(){
            console.log('A user disconnected '+socket.id);

        })



    })






}