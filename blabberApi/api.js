var express = require('express');
var usergrid = require('usergrid');
var url = require('url');

var app = new express();
var client = new usergrid.client({
    orgName:'mukundhag',
    appName:'myhome',
    URI:'https://api.usergrid.com',
    //authType:usergrid.AUTH_APP_USER,
    logging: true, //optional - turn on logging, off by default
    buildCurl: true //optional - turn on curl commands, off by default
});

client.login('test','secret',function(err,data){
	console.log (err,data);
	
});

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
app.use(express.methodOverride());
app.use(allowCrossDomain);


app.get("/homes", function (req, res) {
	var reqUrl = url.parse(req.url,true) ;
	var path = reqUrl.pathname ;
	var query = reqUrl.query;
	console.log(path);
	console.log (query);   
	if (query.zipcode){
		var options = {'method':'GET','endpoint':'homes','qs':{'ql':'select * where zipcode=\''+query.zipcode+"\'"}};
		internalReq(options,req,res);
	}else if ( query.street && query.city){
		var options = {'method':'GET','endpoint':'homes','qs':{'ql':'select * where  street contains \''+query.street+"\'&city contains \'"+query.city+"\'"}};
		internalReq(options,req,res);
	}
	else if ( query.city){
		var options = {'method':'GET','endpoint':'homes','qs':{'ql':'select * where  city contains \''+query.city+"\'"}};
		internalReq(options,req,res);
	}else if ( query.search ){
		var options = {'method':'GET','endpoint':'homes','qs':{'ql':'select * where  city contains \''+query.search+'\' or street contains \'' + query.search + '\' or zipcode contains \'' + query.search + '\''}};
		console.log ( options) ;
		internalReq(options,req,res);
	}
	else{
		
		console.log("All matches failed") ;
		res.writeHeader(500);
		res.end(response);

	}
});

app.post("/homes",function(req,res){
	var dataChunk;
	req.on('data', function(chunk) {
	      dataChunk = (chunk.toString());
	  	
	    });
	req.on('end',function(){
		verifyToken(req,function(err,uuid){
			if (!err)
			{
				var options = {'method':'POST','endpoint':'homes','body':eval("(" + dataChunk + ")")};
				internalReq(options, req, res);
			}else{
				res.end({'error':'invalid_token'});	
			}
		});
	});
	
});

app.get("/homes/:homeid",function(req,res){
	var options = {'method':'GET','endpoint':'homes/'+req.params.homeid};
  	internalReq(options, req, res);
});


app.post("/homes/:homeid/reviews",function(req,res){
	var datachunk ;
	req.on('data', function(chunk) {
	      datachunk= (chunk.toString());
	});
	req.on('end',function(){
		verifyToken(req,function(err,uuid){
			if ( !err){
		      var options = {'method':'POST','endpoint':'reviews','body':eval("(" +datachunk + ")")};
		  	  var connName = "homes/"+req.params.homeid+"/has/reviews/" ;
		  	  var connName2 = "users/"+uuid+"/added/reviews/";
		      //Move it to a function
		  	  internalReqWithConn(options,req,res,connName,connName2);
			}else{
				res.end({'error':'invalid_token'});	
			}
		});
	});
	
	
});


app.get("/homes/:homeid/reviews",function(req,res){
      var options = {'method':'GET','endpoint':'homes/'+req.params.homeid+'/has/reviews'};
	  	internalReq(options, req, res);
	
});

app.post("/homes/:homeid/reviews/:reviewid/comments",function(req,res){
	var dataChunk ;
	req.on('data', function(chunk) {
	      dataChunk = chunk.toString();
	    });
	req.on('end',function(){
		verifyToken(req,function(err,uuid){
			if (!err)
			{
			 var options = {'method':'POST','endpoint':'comments','body':eval("(" + dataChunk + ")")};
		  	 var connName = "reviews/"+req.params.reviewid+"/has/comments/" ;
		  	 var connName2 = "users/"+uuid+"/added/comments/" ;
		  	 internalReqWithConn(options,req,res,connName,connName2);
			}else{
				res.end("{'error':'invalid_token'}");	
			}
		});
	});
});


app.get("/homes/:homeid/reviews/:reviewid/comments",function(req,res){
      var options = {'method':'GET','endpoint':'reviews/'+req.params.reviewid+'/has/comments'};
	  	internalReq(options, req, res);
});

app.post ( "/homes/:homeid/requests", function (req,res){
	var datachunk ;
	req.on('data', function(chunk) {
	      datachunk= (chunk.toString());
	});
	req.on('end',function(){
		verifyToken(req,function(err,uuid){
			if ( !err){
		      var options = {'method':'POST','endpoint':'requests','body':eval("(" +datachunk + ")")};
		  	  var connName = "homes/"+req.params.homeid+"/has/requests/" ;
		  	  var connName2 = "users/"+uuid+"/added/requests/";
		      //Move it to a function
		  	  internalReqWithConn(options,req,res,connName,connName2);
			}else{
				console.log('authorization error while creating request');
				res.end("{'error':'invalid_token'}");	
			}
		});
	});
});

app.get ("/users/:userid/requests",function(req,res){
	verifyToken(req,function(err,uuid){
		if ( !err ){
			var options = {'method':'GET','endpoint':'users/' + uuid + '/added/requests' } ;
			internalReq(options, req, res) ;
		}else{
			res.end ("{'error':'invalid_token'}");
		}
	});
});

app.get ("/users/:userid/homes",function(req,res){
	verifyToken(req,function(err,uuid){
		if ( !err ){
			var options = {'method':'GET','endpoint':'users/' + uuid + '/belongs_to/homes' } ;
			internalReq(options, req, res) ;
		}else{
			res.end ("{'error':'invalid_token'}");
		}
	});
});

app.get ("/users/:userid/requests/:requestid/bids",function(req,res){
	verifyToken(req,function(err,uuid){
		if ( !err ){
			var options = {'method':'GET','endpoint':'users/' + uuid + '/added/requests/' + req.params.requestid + '/has/bids' } ;
			internalReq(options, req, res) ;
		}else{
			res.end ("{'error':'invalid_token'}");
		}
	});
});

app.get ("/users/:userid/bids",function(req,res){
	verifyToken(req,function(err,uuid){
		if ( !err ){
			var options = {'method':'GET','endpoint':'users/' + uuid + '/added/bids' } ;
			internalReq(options, req, res) ;
		}else{
			res.end ("{'error':'invalid_token'}");
		}
	});
});

app.get ("/homes/:homeid/requests",function(req,res){
	var options = {'method':'GET','endpoint':'homes/' + req.params.homeid + '/has/requests' } ;
	internalReq(options, req, res) ;
});


app.get ("/homes/:homeid/requests/:requestid",function(req,res){
	var options = {'method':'GET', 'endpoint' :'homes/' + req.params.homeid + '/has/requests/' + req.params.requestid} ;
	internalReq(options, req, res);
});

app.get ("/users/:userid/requests/:requestid",function(req,res){
	//find connection homes and call /homes/:homeid/requests/:requestid
});

app.post("/homes/:homeid/requests/:requestid/bids",function(req,res){
	var dataChunk ;
	req.on('data', function(chunk) {
	      dataChunk = chunk.toString();
	    });
	req.on('end',function(){
		verifyToken(req,function(err,uuid){
			if (!err)
			{
			 var options = {'method':'POST','endpoint':'bids','body':eval("(" + dataChunk + ")")};
		  	 var connName = "requests/"+req.params.requestid+"/has/bids/" ;
		  	 var connName2 = "users/"+uuid+"/added/bids/" ;
		  	 internalReqWithConn(options,req,res,connName,connName2);
			}else{
				res.end("{'error':'invalid_token'}");	
			}
		});
	});
});
app.get ("/homes/:homeid/requests/:requestid/bids",function(req,res){
	verifyToken(req,function(err,uuid){
		if ( !err ){
			var options = {'method':'GET','endpoint':'requests/' + req.params.requestid + '/has/bids/'  } ;
			internalReq(options, req, res) ;
		}else{
			res.end ("{'error':'invalid_token'}");
		}
	});
});

app.get ("/homes/:homeid/requests/:requestid/bids/:bidid",function(req,res){
	verifyToken(req,function(err,uuid){
		if ( !err ){
			var options = {'method':'GET','endpoint':'reqests/' + req.params.requestid + '/has/bids/' + req.params.bidid  } ;
			internalReq(options, req, res) ;
		}else{
			res.end ("{'error':'invalid_token'}");
		}
	});
});



app.get("/oauth/authorize", function(req,res){
	var reqUrl = url.parse(req.url,true) ;
	var client_id = reqUrl.query.client_id;
	var redirect_url = reqUrl.query.redirect_url;
	var grant_type = reqUrl.query.grant_type;
	var response_type = reqUrl.query.response_type;
	res.redirect ("/?redirect_url=" + redirect_url) ;
});

function verifyToken (req, callback){
	var authHeader = req.headers.authorization ;
	if ( authHeader !=null )
	{
		var token = authHeader.split (" ")[1];
		var ugclient = new usergrid.client({
		    orgName:'mukundhag',
		    appName:'myhome',
		    URI:'https://api.usergrid.com',
		    //authType:usergrid.AUTH_APP_USER,
		    logging: true, //optional - turn on logging, off by default
		    buildCurl: true //optional - turn on curl commands, off by default
		});
		ugclient.setToken (token);
		ugclient.getLoggedInUser(function(err,data,user){
			if ( !err)
			{
				console.log ("Logged in user = "+ data.entities[0].uuid) ;
				callback(err,data.entities[0].uuid);
			}else{
				console.log ('Authentication failed')
				console.log(data);
				callback( err, data);
			}
		});
	}else{
		callback(true,null);
	}
}

function internalReqWithConn(options,req,res,connName,connName2){
	console.log(options);
	 client.request (options,function(success,response){
	  		if (!success){
	  			console.log(response);
	  			//Now create the connection
	  			connName+=response.entities[0].uuid;
	  			var connOptions = {'method':'POST','endpoint':connName};
	  			client.request(connOptions,function(suc,conResponse){
	  				if ( connName2)
	  				{
	  					connName2+=response.entities[0].uuid;
	  					var connOptions2 = {'method':'POST','endpoint':connName2}
	  					client.request(connOptions2,function(suc1,conResponse1){
	  						res.writeHead(200, {'Content-Type':'application/json'}) ;
	  						res.end(JSON.stringify(response.entities));
	  					});
	  					
	  				}else{
	  					res.writeHead(200, {'Content-Type':'application/json'}) ;
  						res.end(JSON.stringify(response.entities));
	  				}
	  			});
	  		}else{
	  			res.end(response);
	  		}
	      });
}

function internalReq(options,req,res){
	client.request (options,function(success,response){
		if (!success){
			res.writeHead(200, {'Content-Type':'application/json'}) ;
        	res.end(JSON.stringify(response.entities));
		}else{
			res.end(JSON.stringify(response));
		}
});

}

app.use(express.static(__dirname+'/public'));
app.use("/js",express.static(__dirname+'/js'));

var port = process.env.PORT || 3000;
app.listen(port);

console.log('Server running at localhost:7777');