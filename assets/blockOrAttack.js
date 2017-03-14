$(document).ready( function() {

  fakeBattle();

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









/*///////*/
/*BEGIN */
/*RE-USABLE JAVASCRIPT*/

//This function lets us style the console.log
console.alert = function( msg){
  console.log( '%c %s %s %s ', 'color: #333; background-color: #ccc;', '*', msg, '*');
}
//This function lets us style the console.log
console.important = function( msg){
  console.log( '%c%s %s %s', 'color: white; font-weight: bold; background-color: rgba(0,100,50,1)', '! ', msg, ' !');
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