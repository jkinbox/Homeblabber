var homeSearchResult ;
var bounds;
var markersArray =new Array();
var accessToken;
var user_uuid; 


$(document).ready(function () {
	
	 $('#login').bind('click', function() {
		    var location = window.location.protocol + '//' + window.location.host;
		    var path = window.location.pathname;
		    console.log(location);
		    console.log(path);
		    if ( !path)
		    	path='';
		    console.log(location+path);
		    
		    var link = "http://localhost:3000/oauth/authorize?";
		    link += "redirect_url=";
		    link += location+path;
		    //now forward the user to facebook
		    console.log(link);
		    
		    window.location = link;
		  });
	 
	$('#addressSearchButton').live ('click',function(){
		var search = $('#addressSearchInput').val() ;
		console.log ( "Searching for " + search ); 
		
		
		$.ajax({url:"http://localhost:3000/homes?search=" + search,success:function(result1,status,jqXHR){
			console.log(result1);
			homeSearchResult =  result1 ;
			
			$.mobile.changePage ("#places");
		}});
	 
	});
	
	$('#home').live("pageshow",function(){
		if (accessToken){
			$('#login .ui-btn-text').html('Logout');
		}
	});
	 $('#places').live("pageshow", function() {
		 console.log("Page Show");
		 loadMarkers();
         $('#map_canvas').gmap('refresh');
	 });
	 $('#places').live("pageinit", function() {
		 console.log("Page Init");
		 //$('#map_canvas').gmap({'center': '37.784500, -122.403800'});
		 $('#map_canvas').gmap().bind('init', function(evt, map) { 
			// loadMarkers();	 
		 });
         
	 });
 	 
	 $('#popup-my-homes').live('popupbeforeposition',function(){
		 $('#list-popup-my-homes').listview('refresh');
	 });
	 
	 $('#showReviews').live('click',function(){
		 var uuid = $('#showReviews').attr('homeuuid');
		 $.ajax({url:"http://localhost:3000/homes/"+uuid+"/reviews",success:function(result1,status,jqXHR){
				console.log(result1);
				$('#review-homeuuid').attr('value',uuid);
				loadReviews(result1,uuid) ;
			}});
	 });
	 
	 $('#button-show-requests-for-home').live('click',function(){
		 if ( accessToken ){
			 var uuid = $('#button-show-requests-for-home').attr('homeuuid');
			 $.ajax({url:"http://localhost:3000/homes/"+uuid+"/requests", headers:{Authorization: 'Bearer ' + accessToken}, success:function(result1,status,jqXHR){
				 loadRequests(result1);
			 }});
		 }else{
			 $('#login').trigger('click');
		 }
	 });
	 $('#reviews').live("pageinit",function (){
		 
	 });

	 $('#reviews').live("pageshow",function (){
		 $('#reviewsList').listview('refresh');
	 });
	 
	 $('#comments').live("pageshow",function (){
		 $('#commentsList').listview('refresh');	
	 });
	 
	 $('#page-show-my-requests').live('pageshow',function(){
		 $('#list-requests').listview('refresh');
	 });
	 
	 $('#page-show-bids').live('pageshow',function(){
		 $('#list-bids').listview('refresh');
	 });
	
	 
	$('#btn-create-new-review').live('click', function (){
		if ( accessToken){
			var homeid= $('#review-homeuuid').attr('value');
			var review = $('#post-review-data').val();
			var postdata = "{'review':'" + review+ "'}";
			console.log(homeid);
			$.ajax({type:'POST',url:"http://localhost:3000/homes/"+homeid+"/reviews/" , data:postdata, headers:{Authorization: 'Bearer ' + accessToken}, success:function(result1,status,jqXHR){
				console.log(result1);
				$('#showReviews').trigger('click');
				//$.mobile.changePage ("#places");
				console.log('Review Posted Successfully');
			}});
		}else{
			$('#login').trigger('click');
		}
		
	}) ;
	
	$('#btn-create-new-comment').live('click',function(){
		if ( accessToken){
			var homeid= $('#comment-homeuuid').attr('value');
			var reviewid=$('#comment-reviewuuid').attr('value');
			var comment = $('#post-comment-data').val();
			var postdata = "{'comment':'" + comment+ "'}";
			console.log(reviewid);
			$.ajax({type:'POST',url:"http://localhost:3000/homes/"+homeid+"/reviews/"+reviewid +"/comments" , data:postdata, headers:{Authorization: 'Bearer ' + accessToken}, success:function(result1,status,jqXHR){
				console.log(result1);
				$("a[reviewlink='true' homeuuid='" + homeid + "' reviewuuid='" + reviewid + "']").trigger('click');
				//$.mobile.changePage ("#places");
				console.log('Comments Posted Successfully');
			}});
			
		}else{
			$('#login').trigger('click');
		}
	});

	$('#button-my-requests').live('click',function(){
		if ( accessToken   ){
			$.ajax({type:'GET',url:"http://localhost:3000/users/me/requests/" ,  headers:{Authorization: 'Bearer ' + accessToken}, success:function(result1,status,jqXHR){
				console.log(result1);
				loadRequests(result1);
				$.mobile.changePage('#page-show-my-requests');
			}});
			
		}else{
			$('#login').trigger('click');
		}
	});
	
	$('#button-create-new-request').live('click',function(){
		if ( accessToken ){
			$.ajax({type:'GET' , url:"http://localhost:3000/users/me/homes" , headers:{Authorization: 'Bearer ' + accessToken} , success:function(result1,status,jqXHR){
				console.log(result1);
				if ( result1.length == 0 ){
					$( "#popup-no-homes" ).popup( "open");
				}else{
					var html =  '<li data-role="divider" data-theme="a">Select a Home</li>\n' ;
					$.each ( result1 , function(index,home){
						var address = '<li><a home-my-list="true" homeuuid="' + home.uuid + '"><p>Street: ' + home.street + '</p><p>City: ' + home.city + '</p><p>Zip: ' + home.zipcode + '</p></a></li>' ;
						html=html+ address + '\n';
					});
					
					$("a[home-my-list='true']").live ('click',function(event){
						 var homeid = event.currentTarget.attributes.getNamedItem('homeuuid').value;
						 console.log('Changing Page');
						 $.mobile.changePage('#page-create-new-request');
					});
					$('#list-popup-my-homes').html(html);
					 $('#popup-my-homes').popup();
					 $('#popup-my-homes').popup('open');
				}
			}});
		}else{
			$('#login').trigger('click');
		}
			
	});
});

function loadRequests (requests){
	var html = "" ;
	$.each (requests, function ( index, req){
		html= html+ "<li><a requestLink='true' href='#' data-role='button' requestid='" + req.uuid + "' >" + 
		'<p> Category: ' + req.category + '</p><p> Time: ' + req.time + '</p><p> Budget: ' + req.budget + '</p>' + 
		"</a></li>\n" ;
	});
	$("#list-requests").html(html);
	
	$("a[requestLink='true']").on ("click",function(event){
		event.preventDefault();
		 var requestid = event.currentTarget.attributes.getNamedItem('requestid').value;
		 
		 $.ajax({url:"http://localhost:3000/users/me/requests/" + requestid + "/bids", headers:{Authorization: 'Bearer ' + accessToken},success:function(result1,status,jqXHR){
				console.log(result1);
				loadBids(result1,requestid) ;
			}});
	});
}

function loadBids (bidsResult, requestId){
	var html = "" ;
	$.each (bidsResult, function ( index, bid){
		html= html+ "<li><a bidlink='true' href='#' data-role='button' requestid='" + requestId + "' >" + bid.bid + "</a></li>\n" ;
	});	
	$('#list-bids').html(html);
	$.mobile.changePage ("#page-show-bids");
}

function loadReviews (reviewsResult,homeuuid){
	 var html ="";
	 $('#homeaddress_reviewPage').html($('#homeaddress').html());
	 $.each(reviewsResult , function(index, review){
		 html+="<li><a reviewlink='true' href=\"#\" data-role=\"button\" homeuuid='" + homeuuid + "' reviewuuid='" +review.uuid + "'>" + review.review + "</a></li>\n";
	 });
	 $('#reviewsList').html(html);
	
	 $("a[reviewlink='true']").on ("click",  function (event){
		 console.log("review got clicked");
		 event.preventDefault();
		 var homeid = event.currentTarget.attributes.getNamedItem('homeuuid').value;
		 var reviewid = event.currentTarget.attributes.getNamedItem('reviewuuid').value;
		 
		 $.ajax({url:"http://localhost:3000/homes/"+homeid+"/reviews/" + reviewid + "/comments",success:function(result1,status,jqXHR){
			 
				console.log(result1);
				$('#comment-homeuuid').attr('value',homeid);
				$('#comment-reviewuuid').attr('value',reviewid);
				loadComments(result1,homeid,reviewid) ;
			}});
	 });
	 $.mobile.changePage ("#reviews");
 }

function loadComments (commentsResult , homeid , reviewid){
	var html="" ;
	$('#homeaddress_commentsPage').html($('#homeaddress').html());
	$.each(commentsResult, function ( index, comment){
		html+="<li><a commentlink='true' href=\"#\" data-role=\"button\" homeuuid='" + homeid + "' reviewuuid='" +reviewid + "' commentid='" + comment.uuid+"'>" + comment.comment + "</a></li>\n";
	});
	if ( commentsResult.length == 0 ){
		html = "<li><a href='#' data-role='button'>No Comments</a></li>";
		console.log('setting an empty list for comments');
	}
	$('#commentsList').html(html);
	$.mobile.changePage ("#comments");
}

function loadMarkers(){
	console.log("Loading Markers");
	if ( homeSearchResult)
	{
		console.log(homeSearchResult.length);
		
		for ( i = 0 ; i < markersArray.length ; i ++ ){
			markersArray[i].attr('map',null);
		}
		markersArray = new Array();
		$.each(homeSearchResult , function(index,result)
			{
				if ( result.location ){
					var pos = new google.maps.LatLng(result.location.latitude, result.location.longitude) ; 
					
					var marker = $('#map_canvas').gmap('addMarker', { 
							'position': pos, 'bounds':true 
						});
					marker.click(function() {
							var address = result.street + ',' + result.city + ',' + result.zipcode ;
							$('#homeaddress').html(address);
							$('#showReviews').attr('homeuuid',result.uuid);
							$('#button-show-requests-for-home').attr('homeuuid',result.uuid);
							$('#map_canvas').gmap('openInfoWindow', { 'content': $('#homedetails').html() }, this);
						});
					markersArray.push(marker);
				}
			});
		if ( homeSearchResult[0])
		{
			$('#map_canvas').gmap({'center':new google.maps.LatLng(homeSearchResult[0].location.latitude, homeSearchResult[0].location.longitude), "zoom" : 10}) ;
			console.log("setting center");
		}
		var bounds = new google.maps.LatLngBounds();
		for ( i = 0  ; i < homeSearchResult.length ; i ++ ){
			var pos1 = new google.maps.LatLng(homeSearchResult[i].location.latitude, homeSearchResult[i].location.longitude) ;
			bounds.extend(pos1);
		}
		
		//$('#map_canvas').gmap('get','map').fitBounds(bounds);
		//$('#map_canvas').gmap('get','map').panToBounds(bounds);
		$('#map_canvas').gmap('refresh');
	}
}

//pull the access token out of the query string
var ql = [];
if (window.location.hash) {
  // split up the query string and store in an associative array
  var params = window.location.hash.slice(1).split("#");
  var tmp = params[0].split("&");
  for (var i = 0; i < tmp.length; i++) {
    var vals = tmp[i].split("=");
    ql[vals[0]] = unescape(vals[1]);
  }
}

if (ql['access_token']) {
  accessToken = ql['access_token'];
  console.log('update logout');
  
}


