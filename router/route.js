var schedule=require('node-schedule');

var date=new Date(2017,4,16,10,46,0);

var users={
    user:{

    }

};


module.exports=function(app,io){




    io.on("connection",function(socket){

        console.log("A user connected:"+socket.id);
        socket.emit('message',{'id':socket.id});



        socket.on('register',function(data){
            var d=JSON.parse(data);
            console.log("registering user "+d.id);
            users.user[d.no]=d.id;
            console.log(users);

        })

var j=schedule.scheduleJob(date,function(){
    io.sockets.emit("notify",{"message":"welcome to smartlife"});
})


        socket.on('disconnect',function(){
            console.log('A user disconnected '+socket.id);

        })


    })






}