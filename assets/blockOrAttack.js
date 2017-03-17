// $(document).ready( function() {

//   fakeBattle();

// 	// Initialize Firebase

//   // aashish's firebase
//   var config = {
//     apiKey: "AIzaSyBdtaA3bHl492e6_YZ2Ath_asgO4aFEh7o",
//     authDomain: "blockorattack.firebaseapp.com",
//     databaseURL: "https://blockorattack.firebaseio.com",
//     storageBucket: "blockorattack.appspot.com",
//     messagingSenderId: "864358667731"
//   };
//   firebase.initializeApp(config);


//   var database = firebase.database();

//   var connectionsRef = database.ref("/connections");

//   var connectedRef = database.ref(".info/connected");

//   connectedRef.on("value", function(snap) {

//   // If they are connected..
//   if (snap.val()) {

//     // Add user to the connections list.
//     var con = connectionsRef.push(true);
    
//     // tryTo_AddPlayer(connectionsRef, con.key);
   
//     // Remove user from the connection list when they disconnect or close/leave the page
//     con.onDisconnect().remove();
//   }
// });

//   connectionsRef.on("value", function(snap) {
//     var snapped = snap.val();
//     // Display the viewer count in the html.
//     // The number of online users is the number of children in the connections list.

//   // snap.forEach(function(item) {
//   //       var itemVal = item.val();
//   //       console.log(itemVal);
//   // });

//   console.log(snapped );


//   $("#testing").html(snap.numChildren());
// });

// 	$('input').on("click", function(){
		
// 		// console.log($('input').attr('name'));
// 		var elem = $(this);
// 		console.log(elem);
// 		console.log(elem.attr('name'));
// 	})

// })






//brian's firebase
var config = {
  apiKey: "AIzaSyC_gukjkFH0F_RFGbLeblRTeNw7eh0xCns",
  authDomain: "hw8-block-or-attack-test.firebaseapp.com",
  databaseURL: "https://hw8-block-or-attack-test.firebaseio.com",
  storageBucket: "hw8-block-or-attack-test.appspot.com",
  messagingSenderId: "233481803081"
};
firebase.initializeApp(config);

var database = firebase.database();

var connectionsRef = database.ref("/connections");
var connectedRef = database.ref(".info/connected");

var databaseRef = database.ref();





function spotifyBg() {


//Getting URL with the Spotify ID URI..... 
var differentId = ["0nRE61yZyAJyWpyhmc3gKV", "1pjinuetX7Epcn2X8ydywU", "6nVC9OIVZHAal8gsZMJftr",
"5dTHtzHFPyi8TlTtzoz1J9", "3K4HG9evC7dg3N0R9cYqk4", "5r88wg6oqQGhzykOAkq9zH"];
var randomNum = Math.floor(Math.random() * differentId.length);
console.log("random Num is: " + randomNum);

console.log("spotifyID is: " + differentId[randomNum]);

var randomSong = differentId[randomNum];  
var queryURL = "https://api.spotify.com/v1/tracks/" + randomSong;
      

      $.ajax({
              url: queryURL,
              method: "GET"
          })
          .done(function(response) {
            console.log("Response from the server Below: ");
            console.log(response.preview_url);

            var preview = response.preview_url;
              
            var iframe = document.createElement('iframe' );
            document.body.appendChild(iframe);

            var audioObject = new Audio(preview);
            audioObject.play();
            iframe.appendChild(audioObject);

            
              
          });
}








$(document).ready( function() {
  fakeBattle();
  
  spotifyBg();
  setInterval(spotifyBg, 30000);


  $("#joinGame-submit").on("click", function (event) {
    event.preventDefault();
    gameFunctions("try-to-join-game");
  } );

});


connectedRef.on("value", function(snap) {

  gameFunctions("try-show-JoinGame", snap);
  
});


connectionsRef.on('child_removed', function(snap) {
  var which = snap.val().status;

  //if player
  if(which.split("")[0] == "p"){
    databaseRef.child("game data").child("players").child(which).remove();

    $("#"+which+"-data").find(".name").text( "finding player..." );
    $("#"+which+"-data").find(".wins").text( 0 );
    $("#"+which+"-data").find(".losses").text( 0 );
  }
  //if spectator
  if(which.split("")[0] == "s"){
    databaseRef.child("game data").child("spectators").child(which).remove();
  }
});

connectionsRef.on('child_changed', function(snap) {
  //findout what we need to update..
  //...by grabbing the snap val status
  var which = snap.val().status;
  //if player
  if(which.split("")[0] == "p"){
    $("#"+which+"-data").find(".name").text( snap.val().name );
    $("#"+which+"-data").find(".wins").text( snap.val().wins );
    $("#"+which+"-data").find(".losses").text( snap.val().losses );
    $("#"+which+"-data").find(".health-inner").attr("width", snap.val().hp +"%");
  }
  //if spectator
  if(which.split("")[0] == "s"){
    //set image to idle
    var imageUrl = "./assets/images/spectators/spectator_idle.png";
    $("#"+which).css('background-image', 'url(' + imageUrl + ')');
  }

});


function update_visualDisplay() {
  // body...
}

function gameFunctions(whatToDo, snapshot) {
  var whatToDo_Split = whatToDo.split("_");


  if(whatToDo == "try-show-JoinGame"
    //and we are connected..
    && snapshot.val() ) {

    databaseRef.once("value", function(snap) {

          //check to see if players exist
          //specifically, we are checking to see...
          //..if player 1 or 2 has a key linked to it
          var gameData_P = snap.child("game data").child("players");
          var maybe_Player1 = gameData_P.child("p1").child("key").val();

          var maybe_Player2 = gameData_P.child("p2").child("key").val();

          //check spectators
          //specifically, we are checking to see...
          //..if s1-5 has a key linked to it
          var gameData_S = snap.child("game data").child("spectators");
          var maybe_S1 = gameData_S.child("s1").child("key").val();
          var maybe_S2 = gameData_S.child("s2").child("key").val();
          var maybe_S3 = gameData_S.child("s3").child("key").val();
          var maybe_S4 = gameData_S.child("s4").child("key").val();
          var maybe_S5 = gameData_S.child("s5").child("key").val();
          // var maybe_S5 = gameData_S.child("s5").key;


          //if any of the vars come back null...
          //...player spots are open...
          //...show the joinGame div
          if(!maybe_Player1 || !maybe_Player2
            || !maybe_S1 || !maybe_S2 || !maybe_S3
            || !maybe_S4 || !maybe_S5 ){
          
            $("#joinGame").removeClass("hide");
          }
          
          // if any of those are true...
          //...there are preexisitng players or spectactors...
          ///...show them....

          if(maybe_Player1){
               //take the key that is maybe_player1
               //plug it into the connections..fill in the vars
              connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_Player1).child("name").val();
                  var wins = snap2.child(maybe_Player1).child("wins").val();
                  var losses = snap2.child(maybe_Player1).child("name").val();
                  var hp = snap2.child(maybe_Player1).child("hp").val();

                  $("#p1-data").find(".name").text( name );
                  $("#p1-data").find(".wins").text( wins );
                  $("#p1-data").find(".losses").text( losses );
                  $("#p1-data").find(".health-inner").attr("width", hp+"%");
              });
          }
          if(maybe_Player2){
               //take the key that is maybe_player1
               //plug it into the connections..fill in the vars
              connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_Player2).child("name").val();
                  var wins = snap2.child(maybe_Player2).child("wins").val();
                  var losses = snap2.child(maybe_Player2).child("name").val();
                  var hp = snap2.child(maybe_Player2).child("hp").val();

                  $("#p2-data").find(".name").text( name );
                  $("#p2-data").find(".wins").text( wins );
                  $("#p2-data").find(".losses").text( losses );
                  $("#p2-data").find(".health-inner").attr("width", hp+"%");
              });
          }
          if(maybe_S1){
            //take the key that is maybe_player1
            //plug it into the connections..fill in the vars
            // var gameData_S = snap.child("game data").child("spectators");
            status = gameData_S.child("s1").child("status").val();
            if(status){
              var imageUrl = "./assets/images/spectators/spectator_"+status+".png";
              $("#s1").css('background-image', 'url(' + imageUrl + ')');
            }
          }
          if(maybe_S2){
            //take the key that is maybe_player1
            //plug it into the connections..fill in the vars
            // var gameData_S = snap.child("game data").child("spectators");
            status = gameData_S.child("s2").child("status").val();
            if(status){
              var imageUrl = "./assets/images/spectators/spectator_"+status+".png";
              $("#s2").css('background-image', 'url(' + imageUrl + ')');
            }
          }
          if(maybe_S3){
            //take the key that is maybe_player1
            //plug it into the connections..fill in the vars
            // var gameData_S = snap.child("game data").child("spectators");
            status = gameData_S.child("s3").child("status").val();
            if(status){
              var imageUrl = "./assets/images/spectators/spectator_"+status+".png";
              $("#s3").css('background-image', 'url(' + imageUrl + ')');
            }
          }
          if(maybe_S4){
            //take the key that is maybe_player1
            //plug it into the connections..fill in the vars
            // var gameData_S = snap.child("game data").child("spectators");
            status = gameData_S.child("s4").child("status").val();
            if(status){
              var imageUrl = "./assets/images/spectators/spectator_"+status+".png";
              $("#s4").css('background-image', 'url(' + imageUrl + ')');
            }
          }
          if(maybe_S5){
            //take the key that is maybe_player1
            //plug it into the connections..fill in the vars
            // var gameData_S = snap.child("game data").child("spectators");
            status = gameData_S.child("s5").child("status").val();
            if(status){
              var imageUrl = "./assets/images/spectators/spectator_"+status+".png";
              $("#s5").css('background-image', 'url(' + imageUrl + ')');
            }
          }
    }); 


  }

  if(whatToDo == "try-to-join-game"
    //and the name input inst empty
    && $("#joinGame-input").val().trim() != ""){

      var playerName = capitalizeFirstLetter( $("#joinGame-input").val().trim() );

      databaseRef.once("value", function(snap) {
        snapshot = snap;
        // console.log(snapshot);
        //check to see if there are any open spots
    
        //check players
        //specifically, we are checking to see...
        //..if player 1 or 2 has a key linked to it
        var gameData_P = snapshot.child("game data").child("players");
        var maybe_Player1 = gameData_P.child("p1").child("key").val();
        var maybe_Player2 = gameData_P.child("p2").child("key").val();

        //check spectators
        //specifically, we are checking to see...
        //..if s1-5 has a key linked to it
        var gameData_S = snapshot.child("game data").child("spectators");
        var maybe_S1 = gameData_S.child("s1").child("key").val();
        var maybe_S2 = gameData_S.child("s2").child("key").val();
        var maybe_S3 = gameData_S.child("s3").child("key").val();
        var maybe_S4 = gameData_S.child("s4").child("key").val();
        var maybe_S5 = gameData_S.child("s5").child("key").val();

        //if any of the vars come back null...
        //...spots are open...
        if(!maybe_Player1 || !maybe_Player2
          || !maybe_S1 || !maybe_S2 || !maybe_S3
          || !maybe_S4 || !maybe_S5 ){

          //determine the first open spot
          var first_spot = "";
          //..using a loop and array of all possible choices
          var possible_spots =  [ 
            [maybe_Player1 , "p1"], 
            [maybe_Player2 , "p2"],
            [maybe_S1 , "s1"],
            [maybe_S2 , "s2"],
            [maybe_S3 , "s3"],
            [maybe_S4 , "s4"],
            [maybe_S5 , "s5"] ];
          for (var i = 0; i < possible_spots.length; i++) {
            if(!possible_spots[i][0]){
              //...this computer is now THAT spot
              first_spot = possible_spots[i][1];
              break;
            }
          }
          //if / when first spot is assigned...
          if(first_spot){
            // Add user to the connections list.
            var con = connectionsRef.push(true);
            connectionsRef.child(con.key).update({
                key: con.key,
                name: playerName,
                status: first_spot,
                wins: 0,
                losses: 0,
                hp: 100
            });

            // Remove user from the connection list when they disconnect or close/leave the page
            con.onDisconnect().remove();

            // ..Update the game data..
            // ..to reflect this newly joined computer...
            // ...and to stop further log ins as the same spot

            //for players
            if(first_spot.split("")[0] == "p"){
              var newPlayer = {};
              newPlayer[first_spot] = "test"; //test is the property
              databaseRef.child("game data").child("players").update(newPlayer);

              //this pushes data into new thing
              databaseRef.child("game data").child("players").child(first_spot).update({
                  key: con.key
              });
            }

            //for spectators
            if(first_spot.split("")[0] == "s"){
              var newSpectator = {};
              newSpectator[first_spot] = "test"; //test is the property
              databaseRef.child("game data").child("spectators").update(newSpectator);

              //this pushes data into new thing
              databaseRef.child("game data").child("spectators").child(first_spot).update({
                  key: con.key,
                  status: "idle"
              });
            }

            //empty and hide join input
            $("#joinGame-input").val("");
            $("#joinGame").addClass("hide");

            //modal display that says...
            //..."welcome to the game, ____"
            //...blank var would be based on converting first_spot...
            //...from p# to player #
            //..and from s# to spectator #
          }

        }else{
          //modal display that says..
          //.."sorry, the server is full...
          //..."try again soon :D "...
        }

      });

  }

}





function battle(p1_choice, p2_choice, whosAttacking) {
  var p1_action = "";
  var p2_action = "";
  var defender = "";

  if(whosAttacking == 1){
    p1_action = "attack_";  
    p2_action = "defend_";

    defender = 2;
  }
  if(whosAttacking == 2){
    p1_action = "defend_";  
    p2_action = "attack_";

    defender = 1;
  }
  animationController(p1_action+p1_choice+"_player 1");
  animationController(p2_action+p2_choice+"_player 2");

  //if the two choices match...
  if(p1_choice == p2_choice 
    || whosAttacking == 1 && p2_choice == "idle"
    || whosAttacking == 2 && p1_choice == "idle" ){

    //when the "HIT" occurs
    setTimeout(function(){
      //...if viewer has blood turned on...
      //...show blood
      var bloodSplat = $("<div/>");
      bloodSplat.addClass("blood-splatter-holder");
      $("#p"+defender+"-visual").append(bloodSplat);
      
      for (var i = 0; i < getRandomIntInclusive(8,20); i++) {
        var blood = $("<div>");
        blood.addClass("blood-drip");
        blood.css('left', getRandomIntInclusive(0,100) + "%");
        blood.css('opacity', "."+getRandomIntInclusive(5,9) );
        var width_and_height = getRandomIntInclusive(5,9);
        blood.css('width', "."+width_and_height+"vw" );
        blood.css('height', "."+width_and_height+"vw" );
        blood.css('animation-delay', "."+getRandomIntInclusive(1,3)+"s" );
        bloodSplat.append(blood);
      }

      
      //change hurt defender's image to show the pain!

      //start by grabbing the current bg image...
      //and turning it into something usable
      var currentBG = $( "#p"+defender+"-visual" ).css('background-image').split("/");
      currentBG = currentBG[currentBG.length-1].split(".")[0];
      currentBG = currentBG.split("_")[1];
      
      var hurtType = "";
      if(currentBG == "idle"){}
      if(currentBG == "defend-high"){ hurtType = "-high";}
      if(currentBG == "defend-low"){ hurtType = "-low";}

      if(currentBG != "defend-high"){
        //also shake the hurt defender's container
        shakeThings("p"+defender+"-visual");
      }

      setImage($( "#p"+defender+"-visual" ) ,"p"+defender+"_hurt"+hurtType);
      

      setTimeout(function(){ 
        bloodSplat.remove();
      }, 2000 );

    }, (900) );
  }

}



function animationController(whatToDo) {

  //this is so we can send and interpret...
  //...more complex inputs to this function
  var whatToDo_Split = whatToDo.split("_");

  if(whatToDo_Split[0] == "attack" 
    || whatToDo_Split[0] == "defend"
    || whatToDo_Split[0] == "idle" ){
    
    var action = whatToDo_Split[0];
    var direction = whatToDo_Split[1];
    var playerTrigger = whatToDo_Split[2];

    // console.alert(playerTrigger+" "+action+"s "+direction);

    var myVisual_link = $( "#p"+playerTrigger.slice(-1)+"-visual" );

    //RESET THE PLAYERS CURRENT STATE
    //remove the players current animation
    myVisual_link.removeAttr('class');

    var myAnimation = action+"-"+direction;
    if(action == "idle"){
      setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");
      myAnimation = action;
    }
    //apply the new animation
    myVisual_link.addClass(myAnimation);


    //change the player background images accordingly
    
    if(myAnimation == "attack-high" || myAnimation == "attack-low"){
      setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");

      var wait = 400;
      if(myAnimation == "attack-high"){ wait = 800;}
      setTimeout(function(){ 
        setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_"+myAnimation);
      }, wait);

      setTimeout(function(){ 
        setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");
      }, 2000);
    }

    if(myAnimation == "defend-high" || myAnimation == "defend-low"){
      setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");

      var wait = 400;
      if(myAnimation == "attack-high"){ wait = 800;}
      setTimeout(function(){ 
        setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_"+myAnimation);
      }, wait);

      setTimeout(function(){ 
        setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");
      }, 2000);
    }

    //remove the animation after its completed..
    //...& add the idle state back
    setTimeout(function(){ 
      myVisual_link.removeClass(myAnimation);
      myVisual_link.addClass("idle");
      setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");

    }, 2005);

  }
}

function setImage(element, imageName) {
  imageName = "./assets/images/players/"+imageName+".png";
  element.css('background-image', 'url(" '+imageName+' ")');
}


function returnWinner(p1_choice, p2_choice, whosAttacking) {
  var winner = "draw";
  if(whosAttacking == 1){
    if(p1_choice == "high" && p2_choice == "high"
      || p1_choice == "low" && p2_choice == "low"
      || p1_choice == "low" && p2_choice == "idle"){
      winner = "player 1";
    }
  }
  if(whosAttacking == 2){
    if(p1_choice == "high" && p2_choice == "high"
      || p1_choice == "low" && p2_choice == "low"
      || p1_choice == "idle" && p2_choice == "low"){
      winner = "player 2";
    }
  }
  return winner;
}

function spawnActionInputs(which,where) {

  if(which == "attack"){
    var input_holder = $("<div>");

    var label = $("<label>");
    label.text("Choose Your Attack");
    input_holder.append(label);

    var choices_holder = $("<div>");
    input_holder.append(choices_holder);

    var attack_low = $("input");
    attack_low.attr("type", "submit");
    attack_low.attr("value", "Low");
    attack_low.attr("name", "attack_low");
    choices_holder.append(attack_low);

    var attack_high = $("input");
    attack_high.attr("type", "submit");
    attack_high.attr("value", "High");
    attack_high.attr("name", "attack_high");
    choices_holder.append(attack_high);

    $(where).append(input_holder);
  }

  if(which == "defend"){
    var input_holder = $("<div>");

    var label = $("<label>");
    label.text("Choose Your Defense");
    input_holder.append(label);

    var choices_holder = $("<div>");
    input_holder.append(choices_holder);

    var defend_low = $("input");
    defend_low.attr("type", "submit");
    defend_low.attr("value", "Duck");
    defend_low.attr("name", "defend_low");
    choices_holder.append(defend_low);

    var defend_high = $("input");
    defend_high.attr("type", "submit");
    defend_high.attr("value", "Jump");
    defend_high.attr("name", "defend_high");
    choices_holder.append(defend_high);

    $(where).append(input_holder);
  }

}




function spectatorCheer(playerKey) {
  //if the player Status...
  //...located in the Key...
  //..found through once and the playerKey...
  //...====s1, s2, s3, s4,s5...
  //..then the player is a spectator...
  //...and now we know which one
  var spectatorNumber = "s1"; 

  //...using the spectator number..
  //..go into That spectator...
  //..inside of our Game Data "folder"...

  //..if its status is set to "idle"
  //...you can cheer...
  //update its status to Active...
  //the visual piece will be done

}








/*///////*/
/*BEGIN */
/*RE-USABLE JAVASCRIPT*/

/*requires firebase*/
function once(keyName) {
  var sendBack;
  firebase.database().ref().once("value", function(snapshot) {
    snapshot.forEach(function(itemSnapshot) {
      if(itemSnapshot.key == keyName){
        sendBack = itemSnapshot;
      }
    });
  });
  return sendBack;
}
  

//This function lets us style the console.log
console.alert = function( msg){
  console.log( '%c %s %s %s ', 'color: #333; background-color: #ccc;', '*', msg, '*');
}
//This function lets us style the console.log
console.important = function( msg){
  console.log( '%c%s %s %s', 'color: white; font-weight: bold; background-color: rgba(0,100,50,1)', '! ', msg, ' !');
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shakeThings(el) {
    var thingToShake = document.getElementById(el);

    var elClasses = thingToShake.classList;
    if (elClasses.contains("shake")) { 
      elClasses.remove("shake"); 
    }

  thingToShake.classList.add("shake");
  setTimeout(function(){ elClasses.remove("shake"); }, 500);
}


/*END */
/*RE-USABLE JAVASCRIPT*/
/*///////*/











///TEMPORARY FUNCTION
/// to test the battle system

function fakeBattle() {
  var timeKeeper = 1000;

  // testing player 1 animations
  setTimeout(function(){ 
    battle("high","idle",1);
  }, (timeKeeper) );

  setTimeout(function(){ 
    battle("high","high",1);
  }, (timeKeeper*4) );

  setTimeout(function(){ 
        battle("high","low",1);
  }, (timeKeeper*8) );

  setTimeout(function(){ 
    battle("low","high",1);
  }, (timeKeeper*16) );

  setTimeout(function(){ 
    battle("low","low",1);
  }, (timeKeeper*20) );

  // testing player 2 animations
  setTimeout(function(){ 
    battle("idle","high",2);
  }, (timeKeeper*24) );

  setTimeout(function(){ 
    battle("high","high",2);
  }, (timeKeeper*28) );

  setTimeout(function(){ 
    battle("high","low",2);
  }, (timeKeeper*32) );

  setTimeout(function(){ 
    battle("low","high",2);
  }, (timeKeeper*36) );

  setTimeout(function(){ 
    battle("low","low",2);
  }, (timeKeeper*40) );


  // repeat these tests
  setTimeout(function(){ 
    fakeBattle();
  }, (timeKeeper*44) );  
}