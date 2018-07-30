var usergrid = "http://localhost:8080/homeblabber/api/" ;
var api = "https://jk-27110-eval-test.apigee.net/"
var apigeekey = "Z9hR6SlTafutKAqsa0nsGvxiQYHFkno6"

// Initialize Firebase
  var config = {
    apiKey: "AIzaSyCLNyLRxMg4L4KyJYmEtMlCWr_mMZWP-Us",
    authDomain: "blabberdata.firebaseapp.com",
    databaseURL: "https://blabberdata.firebaseio.com",
    projectId: "blabberdata",
    storageBucket: "blabberdata.appspot.com",
    messagingSenderId: "278581493165"
  };
  firebase.initializeApp(config);   
  
  
$(document).ready(function(){
	// FirebaseUI config.
      var uiConfig = {
        signInSuccessUrl: 'http://localhost:3000',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          /*firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID*/
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
      };
	  
      initApp = function() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
	$('#page-welcome').show();
		var link = api + "homedata/homes.json?apikey=" +apigeekey;
		
		makeAjax(link,"GET",function(response){
			//console.log(response);
			homeSearchResult = response ;
	     var elem = generateData(homeSearchResult);
		// console.log(elem);
		document.getElementById("resultbody").innerHTML = elem;
		},null,true);
		
	
		  } else {
          // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
	  ui.start('#firebaseui-auth-container', uiConfig);
          }
        }, function(error) {
          console.log(error);
        });
      };

      window.addEventListener('load', function() {
        initApp()
      });
	
	$('#btn-address-search').on ('click',function(){
		var search = $('#input-address-search').val() ;
		console.log ( "Searching for " + search ); 
		var link = api + "homedata/homes.json?apikey=" +apigeekey + "&orderBy=\"zip\"&&startAt=\"" +search + "\"&print=pretty";
		
		makeAjax(link,"GET",function(response){
			
			homeSearchResult =response;
			//var obj = JSON.stringify(homeSearchResult);
			//console.log(obj);
			//var temp = obj;
		var elem = generateDataResult(homeSearchResult);
		// console.log(elem);
		document.getElementById("resultbody").innerHTML = elem;
		},null,true);		
	});

	$('#input-address-search').typeahead({source:getAddressSuggestions, updater:getSelectedAddress,items:8, minLength:1});
});

function getAddressSuggestions(query,callback){
	var search = $('#input-address-search').val() ;
	//console.log ( "Searching for " + search ); 
	var link = api + "homedata/homes.json?apikey=" +apigeekey + "&orderBy=\"zip\"&&startAt=\"" +search + "\"";
		
	makeAjax(link,"GET",function(response){
		//console.log(response);
		homeSearchResult = response ;
		var ele = generateDataResult(homeSearchResult);
		// console.log(ele);
		document.getElementById("resultbody").innerHTML = ele;
		/*var j ;
		var arr =[];      
		for(j=0;j<response.length; j++){
			var en = response[j];
			var add = en.street + ", " + en.city + ", " + en.state ;
			arr.push(add);
		}	*/
		//callback(elem);
	},null,true);
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

function generateData(homeSearch){
	
	var bodyelement = '';
	console.log(homeSearch);
	for(j=0;j<homeSearch.length; j++){
		var en = homeSearch[j];
		bodyelement += "<div class=\"col-md-4\"> <div class=\"card mb-4 shadow-sm\"> <img class=\"card-img-top\" src=\""+en.img+"\" alt=\"Card image\"> <div class=\"card-body\">  <p class=\"card-text\"><b> City : </b>" +en.city+"<br /> <b> Property Type : </b>"+ en.type+ "<br /> <b>Property Area : </b>" + en.area +"</p> <div class=\"d-flex justify-content-between align-items-center\"> <div class=\"btn-group\"> <button type=\"button\" class=\"btn btn-sm btn-outline-secondary\">View</button> </div> <small class=\"text-muted\">9 mins</small> </div> </div></div></div>";
		//console.log(bodyelement);
	}
	//console.log(bodyelement);
	return bodyelement;
}


function generateDataResult(homeSearch){
	
	var bodyelement = '';
	console.log(homeSearch);
	for (var i in homeSearch) {
		console.log(i);
		if (!homeSearch.hasOwnProperty(i)) continue;
		if (typeof homeSearch[i] == 'object') {
			var en = homeSearch[i];
		bodyelement += "<div class=\"col-md-4\"> <div class=\"card mb-4 shadow-sm\"> <img class=\"card-img-top\" src=\""+en.img+"\" alt=\"Card image\"> <div class=\"card-body\">  <p class=\"card-text\"><b> City : </b>" +en.city+"<br /> <b> Property Type : </b>"+ en.type+ "<br /> <b>Property Area : </b>" + en.area +"</p> <div class=\"d-flex justify-content-between align-items-center\"> <div class=\"btn-group\"> <button type=\"button\" class=\"btn btn-sm btn-outline-secondary\">View</button> </div> <small class=\"text-muted\">9 mins</small> </div> </div></div></div>";
		//console.log(bodyelement);
		}
    
}
	
	//console.log(bodyelement);
	return bodyelement;
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
