


var users={
    user:{

    }

};

module.exports=function(app,io,_db){



    io.on("connection",function(socket){

        console.log("A user connected:"+socket.id);
        socket.emit('id',{'id':socket.id});



        socket.on("register",function(data){
            var d=JSON.parse(data);
            console.log("registering user "+d.id);
            users.user[d.no]=d.id;
            console.log(users);

        })




        socket.on('disconnect',function(){
            console.log('A user disconnected '+socket.id);
        })


    })







}