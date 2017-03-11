
var path=require('path');




module.exports=function(app){


    app.post("/handshake",function(req,res){
        console.log("User entered"+req.body.name);
        res.send("hai");
    })

app.get("/handshake",function(req,res){
    //res.sendFile(path1.join(__dirname,'../public','index.html'));
    console.log("request been made from arduino "+req.query.name);
res.send("hai");

})

}