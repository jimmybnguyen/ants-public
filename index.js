'use strict';

var ants = require('./lib/ants_ui.js'); //load the game (UI-level) to interact with it

if(process.argv[2] === '--debug'){
  //the scenario to play
  var colony = ants.AntColony.createDefaultColony();
  var hive = ants.Hive.createTestHive();
  var game = new ants.AntGame(colony, hive);
  
  game.deployAnt('Bodyguard', '0,5');
  game.takeTurn();
  game.takeTurn();
  game.takeTurn(); 
  game.takeTurn(); 
  game.takeTurn(); 
  game.deployAnt('Fire', '0,4');
  game.takeTurn();
  game.takeTurn(); 
  game.takeTurn(); 
  ants.showMapOf(game);

  //ants.play(game); //launch the interactive version from here

}
else {
  //initialize the game to play (not interactively selected yet)
  var colony = ants.AntColony.createTestColony();
  var hive = ants.Hive.createTestHive();
  var game = new ants.AntGame(colony, hive);

  //start playing the game
  ants.play(game); 
}
