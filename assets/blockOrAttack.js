$(document).ready( function() {

	// Initialize Firebase
  var config = {
    apiKey: "AIzaSyBdtaA3bHl492e6_YZ2Ath_asgO4aFEh7o",
    authDomain: "blockorattack.firebaseapp.com",
    databaseURL: "https://blockorattack.firebaseio.com",
    storageBucket: "blockorattack.appspot.com",
    messagingSenderId: "864358667731"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  var connectionsRef = database.ref("/connections");

  var connectedRef = database.ref(".info/connected");

  connectedRef.on("value", function(snap) {

  // If they are connected..
  if (snap.val()) {

    // Add user to the connections list.
    var con = connectionsRef.push(true);

    // Remove user from the connection list when they disconnect or close/leave the page
    con.onDisconnect().remove();
  }
});

  connectionsRef.on("value", function(snap) {

  // Display the viewer count in the html.
  // The number of online users is the number of children in the connections list.
  $("#testing").html(snap.numChildren());
});

	$('input').on("click", function(){
		
		// console.log($('input').attr('name'));
		var elem = $(this);
		console.log(elem);
		console.log(elem.attr('name'));

	})

})