
var path=require('path');




module.exports=function(app){


    app.post("/connect",function(req,res){
        console.log("User entered"+req.body.id);


    })

app.get("/",function(req,res){
    //res.sendFile(path1.join(__dirname,'../public','index.html'));
    res.sendFile(path.join(__dirname,'../html','/index.html'));

})

}