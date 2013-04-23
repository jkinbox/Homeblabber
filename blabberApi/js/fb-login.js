


////bind the previous button to the proper method in the collection object
//$('#logout-button').bind('click', function() {
//  logout();
//});

//load up the facebook api sdk
window.fbAsyncInit = function() {
  FB.init({
    appId      : '124268704415421', // App ID
    channelUrl : 'http://murmuring-ocean-2773.herokuapp.com/channel.html', // Channel File
    status     : true, // check login status
    cookie     : true, // enable cookies to allow the server to access the session
    xfbml      : true  // parse XFBML
  });
};

function logout() {
  FB.logout(function(response) {
    Usergrid.ApiClient.logoutAppUser();
    var html = "User logged out. \r\n\r\n // Press 'Log in' to log in with Facebook.";
    $('#facebook-status').html(html);
  });
}

function login(facebookAccessToken) {
  client.loginFacebook(facebookAccessToken, function(err, response){
    var output = JSON.stringify(response, null, 2);
    if (err) {
      var html = '<pre>Oops!  There was an error logging you in. \r\n\r\n';
      html += 'Error: \r\n' + output+'</pre>';
    } else {
      var html = '<pre>Hurray!  You have been logged in. \r\n\r\n';
      html += 'Facebook Token: ' + '\r\n' + facebookAccessToken + '\r\n\r\n';
      html += 'Facebook Profile data stored in Usergrid: \r\n' + output+'</pre>';
    }
    $('#facebook-status').html(html);
  })
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
  var facebookAccessToken = ql['access_token']
  //try to log in with facebook
  login(facebookAccessToken);
}
});
