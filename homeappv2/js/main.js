var usergrid = "http://localhost:8080/homeblabber/api/" ;
var api = "http://localhost:3000/"

var loggedinuser ;
var accessToken ;
var homeSearchResult;

$(document).ready(function(){
	showPage('page-login');
	$('#btn-login').on('click',function(e){
			e.preventDefault();
			var link = usergrid + 'token' ;
			var username = $('#input-username').val();
			var password = $('#input-password').val();
			var body = JSON.stringify({grant_type:'password', username:username ,password: password});
			showPageLoading('Signing In..');
			makeAjax(link,"POST",function(response){
				console.log(response);

				hidePageLoading();
				if ( response.access_token){
					accessToken = response.access_token ;
					loggedinuser=response.user;
					$('#div-login-error-message').html('');
					$('div[divtype="page"]').hide();
					$('#page-welcome').show();
					$('#div-login-error-message').attr('class','');
				}
				else{
					console.log('login failed');
					var errorMessage = '<button type="button" class="close" data-dismiss="alert">&times;</button><strong>Invalid Credentials</strong>'
					$('#div-login-error-message').html(errorMessage);
					$('#div-login-error-message').attr('class',"alert alert-error");
				}
			}, body,false);
			console.log('on Login Page click');
		});
	$('#btn-address-search').on ('click',function(){
		var search = $('#input-address-search').val() ;
		console.log ( "Searching for " + search ); 
		var link = api + "homes?search=" +search;
		
		makeAjax(link,"GET",function(response){
			console.log(response);
			homeSearchResult = response ;

		},null,false);
	});

	$('#input-address-search').typeahead({source:getAddressSuggestions, updater:getSelectedAddress,items:8, minLength:1});
});

function getAddressSuggestions(query,callback){
	var search = $('#input-address-search').val() ;
	console.log ( "Searching for " + search ); 
	var link = api + "homes?search=" +search;
		
	makeAjax(link,"GET",function(response){
		console.log(response);
		homeSearchResult = response ;
		var j ;
		var arr =[];
		for(j=0;j<response.length; j++){
			var en = response[j];
			var add = en.street + ", " + en.city + ", " + en.state ;
			arr.push(add);
		}
		callback(arr);
	},null,false);
}

function getSelectedAddress(item){
	for(j=0;j<homeSearchResult.length; j++){
			var en = homeSearchResult[j];
			var add = en.street + ", " + en.city + ", " + en.state ;
			if ( add==item){
				console.log('found selected address');
				var uuid = en.uuid;
				$('#heading-address-image').attr('src','holder.js/300x300');
				$('#heading-address-name').html(item);
				$('#btn-add-review').attr('home',uuid);				
				
				var link = api + 'homes/' + uuid + "/reviews" ;
				makeAjax (link, "GET" , function(response){
					console.log(response);
					showPage ('page-address-detail');
				},null,false);
			}
		}
	return item;
}
function showPage (id){
	$('div[divtype="page"]').hide();
	$('#' + id).show();
}

function showPageLoading(message){
	if(message)
		$('#label-page-loading-text').html(message);
	$('#modal-show-loading').show();
}

function hidePageLoading(){
	$('#modal-show-loading').hide();
}

function makeAjax (path, method, callback,postdata,needjson){
	var request = new XMLHttpRequest();
	console.log(path);
	request.onreadystatechange=state_change;
	request.open(method, path, true);
	
	if(needjson){
		request.setRequestHeader('Accept', 'application/json');	
	}

	if ( method=="POST"){
		request.send(postdata);
	}else{
		request.send(null);
	}
	    function state_change()
		{
		if (request.readyState==4)
		  {// 4 = "loaded"
			  if (request.status==200)
			    {
			    	try{

			    		var resp = eval("(" + request.responseText + ")")
			    	}catch(err){
			    		console.log(request.responseText);
			    		console.log(err);
			    		callback({error:true});
			    	}	
			    	callback(resp);
			    }
			    else{
			    	console.log('error '  + request.statusText);
			    	callback({error:true});
			    }

			}
		}
}
