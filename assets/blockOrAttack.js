
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

var myKey = "";

var musicInterval = "";

function spotifyBg() {
  $("#soundHolder").remove();

  //Getting URL with the Spotify ID URI..... 
  var differentId = ["0nRE61yZyAJyWpyhmc3gKV", "1pjinuetX7Epcn2X8ydywU", "6nVC9OIVZHAal8gsZMJftr",
  "5dTHtzHFPyi8TlTtzoz1J9", "3K4HG9evC7dg3N0R9cYqk4", "5r88wg6oqQGhzykOAkq9zH"];
  var randomNum = Math.floor(Math.random() * differentId.length);
  // console.log("random Num is: " + randomNum);

  // console.log("spotifyID is: " + differentId[randomNum]);

  var randomSong = differentId[randomNum];  
  var queryURL = "https://api.spotify.com/v1/tracks/" + randomSong;
      
  $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {
      // console.log("Response from the server Below: ");
      // console.log(response.preview_url);

      var preview = response.preview_url;
        
      var iframe = document.createElement('iframe' );
      document.body.appendChild(iframe);
      iframe.className = "hide";
      iframe.id = "soundHolder";

      var audioObject = new Audio(preview);
      audioObject.play();
      iframe.appendChild(audioObject);          
  });
}



function NasaBG() {

  var r_year = getRandomIntInclusive(2015,2016);
  var r_day = getRandomIntInclusive(1,10);

  var myAPI = "ZDlkfl9kMt4ks2nkESDwn8tK6EISIS9FkUQpQiBn";
  var queryURL = "https://api.nasa.gov/planetary/apod?&date="+r_year+"-01-"+r_day+"&api_key=" + myAPI;
      
      
  $.ajax({
      url: queryURL,
      method: "GET"
    }).done(function(response) {

      var imageURL = response.url;        
      $("#background").css('background-image', 'url(' + imageURL + ')');          
  });

}



$(document).ready( function() {
  // fakeBattle();

  spotifyBg();
  musicInterval = setInterval(spotifyBg, 30000);

  NasaBG();

  //modal display for player quitting
  $(".modal-body").html( "Welcome to Attack or Defend!");
  $("#myModal").modal();


  $("#joinGame-submit").on("click", function (event) {
    event.preventDefault();
    gameFunctions("try-to-join-game");
  } );


  $('body').keyup(function(e){

     if(e.keyCode == 32 && myKey){
        spectatorCheer(myKey);
     }
  });


  $("#sound").on("click", function (event) {
    // event.preventDefault();
    var maybe_sounds = $("#sound").text();
    if(maybe_sounds == "on"){
      $("#soundHolder").remove();
      clearInterval(musicInterval);
      $("#sound").text("off");
    }else{
      spotifyBg();
      musicInterval = setInterval(spotifyBg, 30000);
      $("#sound").text("on");
    }
  } );

});


connectedRef.on("value", function(snap) {

  gameFunctions("try-show-JoinGame", snap);
  
});


connectionsRef.on('child_removed', function(snap) {
  var which = snap.val().status;

  //if player
  if(which !=""){
    if(which.split("")[0] == "p"){
      databaseRef.child("game data").child("players").child(which).remove();

      $("#"+which+"-data").find(".name").text( "No player..." );
      $("#"+which+"-data").find(".wins").text( 0 );
      $("#"+which+"-data").find(".losses").text( 0 );

      $("#"+which+"-visual").addClass("hide");

      gameFunctions("reset-turns");

      //modal display for player quitting
      $(".modal-body").html( which + "has left the game!");
      $("#myModal").modal();

    }
    //if spectator
    if(which.split("")[0] == "s"){
      databaseRef.child("game data").child("spectators").child(which).remove();

      var imageUrl = "./assets/images/spectators/spectator_empty.png";
      $("#"+which).css('background-image', 'url(' + imageUrl + ')');
    }
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
    $("#"+which+"-data").find(".score").text( snap.val().score );
    $("#"+which+"-data").find(".health-inner").attr("width", snap.val().hp +"%");

    $("#"+which+"-visual").removeClass("hide");

    setTimeout(function(){ 
      gameFunctions("try-to-start-game");
    }, 250);
  }
  //if spectator
  if(which.split("")[0] == "s"){
    //set image to idle
    //here
   databaseRef.once("value", function(snap) {
      var gameData_S = snap.child("game data").child("spectators");
      var spectator_status = gameData_S.child(which).child("status").val();

      var imageUrl = "./assets/images/spectators/spectator_idle.png";
      $("#"+which).css('background-image', 'url(' + imageUrl + ')');

    });

  }

  if(snap.val().hp < 1){
    var whichPlayer = snap.val().status;
    console.alert("ROUND OVER. "+ whichPlayer+" lost.");

    //modal display for player quitting
    $(".modal-body").html( whichPlayer+" lost!");
    $("#myModal").modal();

    //change losers image to skeleton
    //and add the KO class out
    var imageUrl = "./assets/images/players/"+whichPlayer+"_skeleton.png";
    $( "#"+whichPlayer+"-visual" ).css('background-image', 'url(' + imageUrl + ')');
    $( "#"+whichPlayer+"-visual" ).addClass("KO").removeClass("idle");  

    // //GIVE OTHER (winner) PLAYER +1 score
    if(myKey){

      var loser = "p1";
      if(whichPlayer = "p1"){ loser = "p2";}

      // console.log("winner"+whichPlayer +"---loser:"+loser);

      databaseRef.once("value", function(snapped) {
        var gameData_P = snapped.child("game data").child("players");
        var winners_key = gameData_P.child(whichPlayer).child("key").val();
        setTimeout(function(){ 
          if(myKey == winners_key){
            // console.log(myKey);
            connectionsRef.once("value", function(snap3) {
                var current_score = snap3.child(myKey).child("score").val();
                current_score = (current_score+1);
                connectionsRef.child(winners_key).update({
                  score: current_score
                });
            });
            
          }
        }, 3000);

      });

      
    }

    //after some time
    //remove the KO class and add the hide class
    //...remove that player (like they quit)
    setTimeout(function(){ 
      $( "#"+whichPlayer+"-visual" ).removeClass("KO").addClass("hide"); 
      var imageUrl = "./assets/images/players/"+whichPlayer+"_idle.png";
      $( "#"+whichPlayer+"-visual" ).css('background-image', 'url(' + imageUrl + ')'); 
    
        //remove player,by removing key too
        connectionsRef.child(snap.val().key).remove();
        gameFunctions("try-show-JoinGame", snap);

    }, 2050);
    //..and do logic
    //... to determine new opponent
  }

});


databaseRef.on('child_changed', function(snap) {

  gameFunctions("try-to-start-game");

  // console.log( snap.val() );

  //are both choices made?
  //...then...sort them, empty them
  //..and we can check who won 

  databaseRef.once("value", function(snap) {
    var gameData_P = snap.child("game data").child("players");
    var player_choice1 = gameData_P.child("p1").child("choice").val();
    var player_choice2 = gameData_P.child("p2").child("choice").val();
    // console.log(player_choice1 + "-"+ player_choice2);
    if(player_choice1 && player_choice2){
      console.alert("Ready to Battle!");
      //which one is an attack?
      var whoAttacked = 0;
      if(player_choice1.split("_")[0] == "attack"){
        whoAttacked = 1;
      }else{
        whoAttacked = 2;
      }

      //split the choices into usable phrases
      var p1c = player_choice1.split("_")[1];
      var p2c = player_choice2.split("_")[1];

      battle(p1c, p2c, whoAttacked);
      // //clear current choices
      databaseRef.child("game data").child("players").child("p1").child("choice").remove();
      databaseRef.child("game data").child("players").child("p2").child("choice").remove();

    }
  });

});

//UPDATING SPECTATORS
var specs = firebase.database().ref("/game data/spectators");

specs.on("child_changed", function(snap) {
    var whichIMG = snap.child("status").val();
    var whichKEY = snap.child("key").val();

    databaseRef.once("value", function(snap) {
      // console.log("ok. "+ which);
      var gameData_S = snap.child("game data").child("spectators");
      var spectator_status = gameData_S.child(whichIMG).child("status").val();

      connectionsRef.once("value", function(snap2) {
        var where = snap2.child(whichKEY).child("status").val();
        var imageUrl = "./assets/images/spectators/spectator_"+whichIMG+".png";
        $("#"+where).css('background-image', 'url(' + imageUrl + ')');

        //time out and then back to idle
        setTimeout(function(){ 
          databaseRef.child("game data").child("spectators").child(where  ).update({ 
              status: "idle"
           });
        }, 250);
      });
    });
});







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

          //check any player or spectator that comes back "TRUE"
          //...see if it has a key that doesnt exists in connections
          //..if so, that player has quit..
          //..remove them...
          //...and set that "maybe" to "" (empty)
          if(maybe_Player1){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_Player1).child("name").val();
                  if(!name){
                    maybe_Player1 = "";
                    databaseRef.child("game data").child("players").child("p1").remove();
                    gameFunctions("reset-turns");
                  }
              });
          }
          if(maybe_Player2){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_Player2).child("name").val();
                  if(!name){
                    maybe_Player2 = "";
                    databaseRef.child("game data").child("players").child("p2").remove();
                  }
              });
          }
          if(maybe_S1){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_S1).child("name").val();
                  if(!name){
                    maybe_S1 = "";
                    databaseRef.child("game data").child("spectators").child("s1").remove();
                  }
              });
          }
          if(maybe_S2){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_S2).child("name").val();
                  if(!name){
                    maybe_S2 = "";
                    databaseRef.child("game data").child("spectators").child("s2").remove();
                  }
              });
          }
          if(maybe_S3){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_S3).child("name").val();
                  if(!name){
                    maybe_S3 = "";
                    databaseRef.child("game data").child("spectators").child("s3").remove();
                  }
              });
          }
          if(maybe_S4){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_S4).child("name").val();
                  if(!name){
                    maybe_S4 = "";
                    databaseRef.child("game data").child("spectators").child("s4").remove();
                  }
              });
          }
          if(maybe_S5){
            connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_S5).child("name").val();
                  if(!name){
                    maybe_S5 = "";
                    databaseRef.child("game data").child("spectators").child("s5").remove();
                  }
              });
          }
          ///after ALL THAT...
          //if any of the vars come back null...
          //...player spots are open...
          //...show the joinGame div
          if(!maybe_Player1 || !maybe_Player2
            || !maybe_S1 || !maybe_S2 || !maybe_S3
            || !maybe_S4 || !maybe_S5 ){
          
            //as long as This page is now already one of these....
            if(myKey != maybe_Player1 && myKey != maybe_Player2){


              $("#joinGame").removeClass("hide");
            }

            gameFunctions("reset-turns");
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
                  var losses = snap2.child(maybe_Player1).child("losses").val();
                  var score = snap2.child(maybe_Player1).child("score").val();
                  var hp = snap2.child(maybe_Player1).child("hp").val();

                  $("#p1-data").find(".name").text( name );
                  $("#p1-data").find(".wins").text( wins );
                  $("#p1-data").find(".losses").text( losses );
                  $("#p1-data").find(".score").text( score );
                  $("#p1-data").find(".health-inner").attr("width", hp+"%");

                  $("#p1-visual").removeClass("hide");

              });
          }
          if(maybe_Player2){
               //take the key that is maybe_player1
               //plug it into the connections..fill in the vars
              connectionsRef.once("value", function(snap2) {
                  var name = snap2.child(maybe_Player2).child("name").val();
                  var wins = snap2.child(maybe_Player2).child("wins").val();
                  var losses = snap2.child(maybe_Player2).child("losses").val();
                  var score = snap2.child(maybe_Player2).child("score").val();
                  var hp = snap2.child(maybe_Player2).child("hp").val();

                  $("#p2-data").find(".name").text( name );
                  $("#p2-data").find(".wins").text( wins );
                  $("#p2-data").find(".losses").text( losses );
                  $("#p2-data").find(".score").text( score );
                  $("#p2-data").find(".health-inner").attr("width", hp+"%");

                  $("#p2-visual").removeClass("hide");
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
            [maybe_Player1 , "p1", "Player One"], 
            [maybe_Player2 , "p2", "Player Two"],
            [maybe_S1 , "s1", "Spectator One"],
            [maybe_S2 , "s2", "Spectator Two"],
            [maybe_S3 , "s3", "Spectator Three"],
            [maybe_S4 , "s4", "Spectator Four"],
            [maybe_S5 , "s5", "Spectator Five"] ];
          for (var i = 0; i < possible_spots.length; i++) {
            if(!possible_spots[i][0]){
              //...this computer is now THAT spot
              first_spot = possible_spots[i][1];
              possible_spots = possible_spots[i][2];
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
                hp: 100,
                score: 0
            });

            // Remove user from the connection list when they disconnect or close/leave the page
            con.onDisconnect().remove();

            //if i am a spectator or previous player...
            //...remove me from spectating
            if(myKey !=""){
              // console.log(myKey);
              connectionsRef.once("value", function(snap8) {
                var amI_aSpectator = snap8.child(myKey).child("status").val();
                if(amI_aSpectator){
                  if(amI_aSpectator.split("")[0] == "s"){
                    databaseRef.child("game data").child("spectators").child(amI_aSpectator).remove();
                    connectionsRef.child(myKey).remove();
                  }
                }

              });
            }
            myKey = con.key;

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
            $(".modal-body").html("Welcome to the game " + playerName + ". You are "+ possible_spots+"." );
          }

        }else{
          //modal display that says..
          //.."sorry, the server is full...
          //..."try again soon :D "...
          $(".modal-body").html("Sorry, the server is full.  Try again soon :D");
        }

      });

  }

  if(whatToDo == "try-to-start-game"){
    //are both players in the game yet?
     databaseRef.once("value", function(snap) {

      var gameData_P = snap.child("game data").child("players");      
      var maybe_Player1 = gameData_P.child("p1").child("key").val();
      var maybe_Player2b = gameData_P.child("p2").child("key").val();
      var currentTurn = snap.child("game data").child("turn").val();

      // console.log(maybe_Player1+"-"+maybe_Player2b+"_"+currentTurn);
      if(maybe_Player1 && maybe_Player2b && currentTurn == 0){
        //game can start!
        gameFunctions("next-turn");
      }
    });
  }

  if(whatToDo == "reset-turns"){
    databaseRef.child("game data").update({ 
      turn: 0
    });

    databaseRef.child("game data").child("whoStarts").remove();

    //remove attack and defense buttons
    $(".player-inputs").remove();

    //clear current choices
    databaseRef.child("game data").child("players").child("p1").child("choice").remove();
    databaseRef.child("game data").child("players").child("p2").child("choice").remove();

    //reset HP ...ALL
    $("#hp1").css("width","100%");
    $("#hp2").css("width","100%");
    //get keys for p1, p2
    //..use those keys to reset the remaining player
    databaseRef.once("value", function(snap2) {
      //grab the keys for p1 and p2
      var gameData_P = snap2.child("game data").child("players");
      var p1_key = gameData_P.child("p1").child("key").val();
      var p2_key = gameData_P.child("p2").child("key").val();
      if(p1_key){
        connectionsRef.child(p1_key).update({
            hp: 100,
            wins: 0,
            losses: 0
        });
      }
      if(p2_key){
        connectionsRef.child(p2_key).update({
            hp: 100,
            wins: 0,
            losses: 0
        });
      }
    });
    
  }

  if(whatToDo == "next-turn"){
    databaseRef.once("value", function(snap) {
      var currentTurn = snap.child("game data").child("turn").val();

      if(currentTurn == 0){
        console.alert("Game Started!");

        if(myKey){
          if(myKey == snap.child("game data").child("players").child("p1").child("key").val() ){
            currentTurn = (currentTurn+1);
            databaseRef.child("game data").update({ 
              turn: currentTurn
            });
          }
        }
        

        //does whoStarts exist?
        //if not, create it...
        //..and let player1 choose an attack
        var maybe_whoStarts = snap.child("game data").child("whoStarts").val();
        if(!maybe_whoStarts){
          databaseRef.child("game data").update({ 
            whoStarts: "p1"
          });

          connectionsRef.once("value", function(snap2) {
            
            if(myKey){
              var whoAmI = snap2.child(myKey).child("status").val();      
              //if my key status == p1
              //show attack inputs for p1_choice
              if(whoAmI == "p1"){
                spawnActionInputs("attack","#p1-holder");
              }
              //if my key status == p2
              //show defense inputs for p2
              if(whoAmI == "p2"){
                spawnActionInputs("defend","#p2-holder");
              }
            }

          });
 
        }
      }else if(currentTurn > 0){
        
        //change who starts the round
        var whoStarted = snap.child("game data").child("whoStarts").val();
        
        var newStarter = "";
        if(whoStarted == "p1"){ newStarter = "p2";
        }else{ newStarter = "p1"; }

        //spawn the appropriate buttons
        connectionsRef.once("value", function(snap2) {

          var whoAmI = "";
          if(myKey){
            whoAmI = snap2.child(myKey).child("status").val(); 
          }

          if(whoAmI == "p1"){
            databaseRef.child("game data").update({ 
                whoStarts: newStarter
            });
          }

          setTimeout(function(){ 
            databaseRef.once("value", function(snap3) {
              
              var whoStarts_newRound = snap3.child("game data").child("whoStarts").val();
              // console.log(whoAmI+"-"+whoStarts_newRound);

              if(whoAmI == whoStarts_newRound){
                spawnActionInputs("attack","#"+whoAmI+"-holder");
              }

              var whosNext = "";
              if(whoStarts_newRound == "p1"){ whosNext = "p2";
              }else{ whosNext = "p1"; }
              if(whoAmI == whosNext){
                spawnActionInputs("defend","#"+whoAmI+"-holder");
              }

            });
          }, 1000);

        });

        //add one to turn!
        if(myKey){
          if(myKey == snap.child("game data").child("players").child("p1").child("key").val() ){
            currentTurn = (currentTurn+1);
            databaseRef.child("game data").update({ 
              turn: currentTurn
            });
          }
        }

      }else{

      }

    });
  }

}





function battle(p1_choice, p2_choice, whosAttacking) {

  // console.log(p1_choice +"-"+p2_choice+"_"+whosAttacking);
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

      //ADJUST SCORE...
      databaseRef.once("value", function(snap2) {
        //grab the keys for p1 and p2
        var gameData_P = snap2.child("game data").child("players");
        var p1_key = gameData_P.child("p1").child("key").val();
        var p2_key = gameData_P.child("p2").child("key").val();

        var atk="";
        var def="";
        if(whosAttacking == 1){
          atk = p1_key;
          def = p2_key;
        }else{
          atk = p2_key;
          def = p1_key;
        }
        // console.log(atk +"--"+def);

        connectionsRef.once("value", function(snap3) {

          //Attacker +1 WINS
          if(myKey == atk){
            var current_atk_wins = snap3.child(atk).child("wins").val();
            current_atk_wins = (current_atk_wins+1);
            connectionsRef.child(atk).update({
              wins: current_atk_wins
            });
          }
          
          //defender +1 LOSSES
          if(myKey == def){
            var current_def_losses = snap3.child(def).child("losses").val();
            current_def_losses = (current_def_losses+1);
            connectionsRef.child(def).update({
              losses: current_def_losses
            });
          }


          //adjust defender health
          //...hp -33.3...if over 0
          var whosDefending = 1;
          if(whosAttacking ==1){ whosDefending = 2;}

          var current_HP = snap3.child(def).child("hp").val();
          if(current_HP > 0){
            current_HP = (current_HP - 33.3);
          }
          if(myKey == def){
            connectionsRef.child(def).update({
              hp: current_HP
            });
          }

          //get an updated whosDefending's hp
          //... from the server...
          //..just to make sure!!!!
          setTimeout(function(){
            connectionsRef.once("value", function(snap5) {
              current_HP = snap5.child(def).child("hp").val();

              // console.log(whosDefending +"--"+ current_HP);
              $("#hp"+whosDefending).css("width", current_HP+"%");

              //shake things!
              shakeThings("", $("#"+whosAttacking+"-data").find(".wins") );
              shakeThings("", $("#"+whosDefending+"-data").find(".losses") );
              shakeThings("",$("#hp"+whosDefending).parent() );

              //if new hp is lower than 0, attacker wins the game!
              if(current_HP < 1){
                  //GAME OVER!
                  //old game over
              }else{
                //NEXT ROUND
                setTimeout(function(){ 
                  gameFunctions("next-turn");
                }, 2000);
              }
            });
          }, 900);

        });

      });

    }, (900) );
    
     
  }else{
    //TIE ROUND
    //...next turn!
    //NEXT ROUND
    setTimeout(function(){ 
      gameFunctions("next-turn");
    }, 2000);
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
        if( !myVisual_link.hasClass("KO") ){
          setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");
        }else{
          setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_skeleton");
        }
      }, 2000);
    }

    //remove the animation after its completed..
    //...& add the idle state back
    ///IF ITS NOT A SKELETON
    setTimeout(function(){ 
      myVisual_link.removeClass(myAnimation);
      if( !myVisual_link.hasClass("KO") ){
        myVisual_link.addClass("idle");
        setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_idle");
      }else{
          setImage(myVisual_link,"p"+playerTrigger.slice(-1)+"_skeleton");
      }

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

function spawnActionInputs(which, where) {

  if(which == "attack"){
    var atk_input_holder = $("<div>");
    atk_input_holder.addClass("player-inputs");

    var atk_label = $("<label>");
    atk_label.text("Choose Your Attack");
    atk_label.addClass("label");
    atk_input_holder.append(atk_label);

    var atk_choices_holder = $("<div>");
    atk_choices_holder.addClass("choices");
    atk_input_holder.append(atk_choices_holder);

    var attack_low = $("<input>");
    attack_low.attr("type", "submit");
    attack_low.attr("value", "Low");
    attack_low.attr("name", "attack_low");
    atk_choices_holder.append(attack_low);

    var attack_high = $("<input>");
    attack_high.attr("type", "submit");
    attack_high.attr("value", "High");
    attack_high.attr("name", "attack_high");
    atk_choices_holder.append(attack_high);

    $(where).append(atk_input_holder);
  }

  if(which == "defend"){
    var def_input_holder = $("<div>");
    def_input_holder.addClass("player-inputs");

    var def_label = $("<label>");
    def_label.text("Choose Your Defense");
    def_label.addClass("label");
    def_input_holder.append(def_label);

    var def_choices_holder = $("<div>");
    def_choices_holder.addClass("choices");
    def_input_holder.append(def_choices_holder);

    var defend_low = $("<input>");
    defend_low.attr("type", "submit");
    defend_low.attr("value", "Duck");
    defend_low.attr("name", "defend_low");
    def_choices_holder.append(defend_low);

    var defend_high = $("<input>");
    defend_high.attr("type", "submit");
    defend_high.attr("value", "Jump");
    defend_high.attr("name", "defend_high");
    def_choices_holder.append(defend_high);

    $(where).append(def_input_holder);
  }

  //attach the input click event
  $(".player-inputs").on("click", function (event) {
    event.preventDefault();
    // event.stopPropagation();
    var myChoice = event.target.name;


    //find which player I am by using mykey / status
    //has this players choice already been decided?
    //if not, THIS is their choice...
    //...update the server And hide the inputs
    connectionsRef.once("value", function(snap) {
      var whichPlayer = "";
      // console.log(myKey);
      if(myKey != ""){
        whichPlayer = snap.child(myKey).child("status").val();
      }
      if(whichPlayer){

        databaseRef.once("value", function(snap) {
          var gameData_P = snap.child("game data").child("players");
          var player_choice = gameData_P.child(whichPlayer).child("choice").val();
          //if you dont find a choice there already....
          if(!player_choice){
            databaseRef.child("game data").child("players").child(whichPlayer).update({ 
              choice: myChoice
            });
            //remove This players inputs
            $(".player-inputs").remove();
          }
        });
      }
    });




  });
}




function spectatorCheer(playerKey) {

  connectionsRef.once("value", function(snap) {
    var whatAmI = snap.child(playerKey).child("status").val();
    if(whatAmI.split("")[0] == "s"){
      //youre a spectator
      // console.log(whatAmI);
      
      databaseRef.once("value", function(snap) {
        var gameData_S = snap.child("game data").child("spectators");
        var spectator_status = gameData_S.child(whatAmI).child("status").val();

        // console.log(spectator_status);
        if(spectator_status == "idle"){
          // console.log(whatAmI);
          //you can cheer!
          databaseRef.child("game data").child("spectators").child(whatAmI).update({ 
            status: "active"
          });
        }
      });
    }
  });
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

function shakeThings(el, jqueryORnot) {
  if(!jqueryORnot){
    var thingToShake = document.getElementById(el);

    var elClasses = thingToShake.classList;
    if (elClasses.contains("shake")) { 
      elClasses.remove("shake"); 
    }

    thingToShake.classList.add("shake");
    setTimeout(function(){ elClasses.remove("shake"); }, 500);
  }else{
    jqueryORnot.removeClass("shake");
    jqueryORnot.addClass("shake");
    setTimeout(function(){ jqueryORnot.removeClass("shake"); }, 500);
  }
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