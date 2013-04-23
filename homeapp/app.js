var express = require('express');
var url = require('url');

var app = new express();

app.use(express.static(__dirname+'/public'));
app.use("/js",express.static(__dirname+'/js'));
app.get("/test",function(req,res){
	res.write('hello world from node');
	res.end();
});
var port = process.env.PORT || 7777;
app.listen(port);

console.log('Server running at localhost:7777');
