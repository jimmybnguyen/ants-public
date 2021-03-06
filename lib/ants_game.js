'use strict';
var index = require('../index.js');
var numberOfQueens = 0;

/**
* Represents an insect (e.g., an Ant or a Bee) in the game
* This class should be treated as abstract
*/
class Insect {
  constructor(armor, place) {
    this._armor = armor;
    this._place = place;
    this._watersafe = false; //whether or not the insect can be on water
  }
  
  get armor() {
    return this._armor;
  }
  
  /**
  * Reduces the armor of the insect
  * @param {number} amount the amount to reduce the armor by
  */
  reduceArmor(amount) {
    this._armor -= amount;
    if(this._armor <= 0){
      console.log(this.toString()+' ran out of armor and expired');
      this.place = undefined; // removes the insect from the field
    }
  }

  get place(){
    return this._place;
  }
  
  get watersafe() {
    return this._watersafe;
  }
    
  /**
  * Adds or remove insect to a place on the field
  * @param {object} place where to add or remove insect
  */
  set place(place){
    if(place === undefined){ //if being removed
      if (this.name == 'Queen') {
          console.log('Queen cannot be removed');
      } else {
         this._place._removeInsect(this);
         this._place = undefined;
      }
    }
    else if(place._addInsect(this)){ //try to go to new place
      if(this._place !== undefined){
        this._place._removeInsect(this); //leave old place
      }
      this._place = place; //save our new location
    }
  }
  
  toString() {
    return this.name + '('+(this.place ? this.place.name : '')+')';
  }
}

/**
* Represents a Bee in the game
*/
class Bee extends Insect {
  constructor(armor, place){
    super(armor, place);
    this.name = 'Bee';
    this._damage = 1;
    this._watersafe = true;
  }
  
  /**
  * Damages an ant
  * @param {object} the ant being damaged
  */
  sting(ant){
    console.log(this+ ' stings '+ant+'!');
    ant.reduceArmor(this._damage);
  }
  
  get blocked() {
      return this.place.ant && this.place.ant.block;
  }
  
  /**
  * The bee performing actions on its turn 
  */
  act() {
      if (this.place != undefined) {
        if(this.blocked) { //damages ants in the way
          this.sting(this.place.ant);
        }
        else if(this.armor > 0) {
          this.place = this.place.exit; // removes the bee from the field
        }
      }
  }
}

/**
* A class representing a basic Ant.
* This class should be treated as abstract
*/
class Ant extends Insect {
  constructor(armor, cost, place){
    super(armor, place);
    this._name = 'Ant'; //for display
    this._foodCost = cost;
    this._block = true;
    this._container = false;
    this._damage = 0;
    this._contained = null;
  }
  
  get foodCost() {
    return this._foodCost;
  }
  
  get name() {
    return this._name;
  }

  //returns whether or not the ant can block a bee
  get block() { 
      return this._block;
  }
    
  get container() {
      return this._container;
  }
  
  changeContainer() {
    this._container = !this._container;    
  }

  /**
  * Checks to see if an ant can store another ant
  * @param {object} other a different ant
  * @return {boolean} true if the ant can store an ant, false otherwise
  */
  canContain(other) {
      if (this._container == true && other.container == true) {
        return false;   
      }
      return this._container == true && this._contained == null; 
      //return this.ant == undefined && this._container == true && other.container == false;
  }
  
  //returns the store ant, if any
  get contained() {
    return this._contained;
  }
  
  get damage() {
    return this._damage;   
  }
    
  /**
  * Increases the damage of this ant
  * @param {number} factor how much to increase the damage by
  */
  multiplyDamage(factor) {
       this._damage *= factor;
  }
}


/**
* Represents a location in the game
*/
class Place {
  constructor(name, exit, entrance) {
    this.name = name;
    this._bees = [];
    this._ant = undefined; //placeholder for code clarity
    this.exit = exit;
    this.entrance = entrance;
  }
  
  /**
  * Adds an insect to the field
  * @param {object} insect the insect to be added
  * @return {boolean} true if the insect can be added, false otherwise
  */
  _addInsect(insect) {
    if(insect instanceof Bee) {
      this._bees.push(insect);
      return true;
    } else if(this._ant == undefined) {
      this._ant = insect;
      return true;
    } else if (this._ant != undefined) { //insect being added in the same place as another
       if (this._ant.canContain(insect)) { //the insect on the field can store the insect being added
           this._ant.containAnt(insect);
            return true;
        } else if (insect.canContain(this._ant)) { // the insect being added can store the insect on the field
           insect.containAnt(this._ant);
           this._ant.changeContainer();
           this._ant = insect; //insect on the field becomes the container insect
           return true;
        }
    }
    return false;
  }

  /**
  * Removes an insect on the field
  * @param {object} the insect to be removed
  */
  _removeInsect(insect) {
    if(insect instanceof Bee){
      var index = this._bees.indexOf(insect);
      if(index >= 0){
        this._bees.splice(index,1);
      }
    } else {
      if (this.ant.contained != null) {
        this._ant = this.ant.contained; //removes the container ant, adds the contained ant
        this._ant.changeContainer(); //removes the green background on the icon 
      } else if (this._ant.name != 'Queen') {
        this._ant = undefined;
      }
    }

  }
  
  get ant() { 
    return this._ant; 
  }

  get bees() {
    return this._bees;
  }
    
  /**
  * Place the stored ant on the field after the container is removed
  * @param {object} ant the contained ant to be placed
  */    
  placeContained(ant) {
    this._ant = ant;   
    this._ant.changeContainer(); //removes the background color of the icon
  }
    
  get water() {
    if (this.name.substring(0,5) == 'water') {
        return true;   
    }
  }
  
  /**
  * Returns a nearby bee 
  * @param {number} minDistance the minimum distance to look at
  * @param {number} maxDistance the maximum distance to look at
  * @return {object} bee
  */ 
  getClosestBee(minDistance, maxDistance) {
		var p = this;
		for(var dist = 0; p!==undefined && dist <= maxDistance; dist++)
		{
			if(dist >= minDistance && p.bees.length > 0) {
				return p.bees[Math.floor(Math.random()*p.bees.length)]; //pick a random bee
      }
			p = p.entrance;
		}
		return undefined; //no bee found
  }

  toString() {
    return `Place[$(this.name)]`;
  }
}

/**
* Represents a location filled with water in the game
*/
class Water extends Place {
    
  _addInsect(insect){
    if(insect.watersafe){
        if(insect instanceof Bee){
            this._bees.push(insect);
            return true;
        } else if(this._ant === undefined) {
          this._ant = insect;
          return true;
        }
    } else {
      return false; //could not add insect
    }
  }
}

/**
* An entire colony of ants and their tunnels
*/
class AntColony {
  constructor(startingFood, numTunnels, tunnelLength, moatFrequency){
    var MAX_TUNNEL_LENGTH = 8;
    tunnelLength = Math.min(tunnelLength, MAX_TUNNEL_LENGTH); //respect the max-length
      
    this._food = startingFood;
    this._places = []; //2d-array storage for easy access
    this._beeEntrances = [];
    this._queenPlace = new Place('Ant Queen');
    this._deployQueen = null; 
    
    //sets up a tunnels, which are linked-lists of places
    var prev, curr, typeName;
		for(var tunnel=0; tunnel < numTunnels; tunnel++)
		{
			curr = this._queenPlace; //start the tunnels at the queen
      this._places[tunnel] = [];
			for(var step=0; step < tunnelLength; step++)
			{
        //water or not?
        typeName = 'tunnel';
        if(moatFrequency !== 0 && (step+1)%moatFrequency === 0){ //if we have moats and we're on a moat count (starting at 1)
          typeName = 'water';
				}
				
				prev = curr; //keep track of the previous guy (who we will exit to)
        var locationId = tunnel+','+step; //location id string
        if (typeName == 'water') {
            curr = new Water(typeName+'['+locationId+']', prev); //create new place with an exit that is the previous spot
                    prev.entrance = curr; //the previous person's entrance is the new spot
                    this._places[tunnel][step] = curr; //keep track of new place
        } else {
            curr = new Place(typeName+'['+locationId+']', prev); //create new place with an exit that is the previous spot
                    prev.entrance = curr; //the previous person's entrance is the new spot
                    this._places[tunnel][step] = curr; //keep track of new place
            }
        }
			this._beeEntrances.push(curr); //current place is last item in the tunnel, so mark that it is a bee entrance
		} //loop to next tunnel
  }
  
  get food() {
    return this._food;
  }
  /**
  * Increases the food the colony
  * @param {number} amount how much to increase food by
  */ 
  increaseFood(amount){
    this._food += amount;
  }
  
  get places() {
    return this._places;
  }

  get entrances() {
    return this._beeEntrances;
  }
    
  //Returns all of the places the queen is at
  get queenPlace() {
    return this._queenPlace;
  }
  //Checks to see if there are bees in the same place as the queen
  get queenHasBees() {
    return this._queenPlace.bees.length > 0;
  }
    
  /**
  * Updates the queen places to a new place
  * @param {object} place where the queen is at now
  */ 
  newQueenPlace(place) {
    this._deployQueen = place;
  }

  get deployQueen() {
    return this._deployQueen;   
  }
    
  /**
  * Adds an ant on the field
  * @param {object} where the ant will be added
  * @param {object} ant the ant to be added
  * @return {boolean} true if the ant can be added, false otherwise
  */ 
  deployAnt(place, ant){
    if (this._food < ant.foodCost) {
        console.log('Not enough food to place ' + ant);   
    }
    if(this._food >= ant.foodCost){
      this._food -= ant.foodCost;
      ant.place = place; //assign the ant
      return ant.place === place; //return if could place the ant
    }
    else {
      return false; //could not place the ant
    }
  }
  
  /**
  * Removes an ant from the field
  * @param {object} place where the ant is to be removed
  */ 
  removeAnt(place){
    place.ant = undefined;
  }
    
  //Returns all of the ants in the colony
  get allAnts() {
    var ants = [];
    for(var i=0; i<this._places.length; i++){
      for(var j=0; j<this._places[i].length; j++){
        if(this._places[i][j].ant !== undefined){
          ants.push(this._places[i][j].ant);
        }
      }
    }
    return ants;
  }
  
  //Return all bees currently in the colony
  get allBees() {
    var bees = [];
    for(var i=0; i<this._places.length; i++){
      for(var j=0; j<this._places[i].length; j++){
        bees = bees.concat(this._places[i][j].bees);
      }
    }
    return bees;    
  }
  
  //Creates a default starting colony
  static createDefaultColony() {
    return new AntColony(2, 1,8,0); 
  }

  //Creates a testing colony with extra food
  static createTestColony() {
    return new AntColony(10, 1,8,0); 
  }

  //Creates a full colony with 3 tunnels
  static createFullColony() {
    return new AntColony(2, 3,8,0);
  }

  //Creates a full colony with three tunnels and moats
  static createWetColony() {
    return new AntColony(2, 3,8,3);
  }
}

/**
* Represents a bee hive in the game
*/ 
class Hive extends Place {
  constructor(beeArmor){
    super('Hive');
    this._beeArmor = beeArmor;
    this._waves = {};
  }

  /**
  * Adds a wave of bees to the game
  * @param {number} attackTurn when the bees will attack
  * @param {number} numBees how many bees will be added in a wave
  * @return {object} the bees
  */ 
  addWave(attackTurn, numBees){
    var wave = [];
    for(var i=0; i<numBees; i++){
      var bee = new Bee(this._beeArmor, this);
      wave.push(bee);
      bee.place = this;
      this._bees.push(bee); //explicitly position the bee; workaround for bug(?)
    }
    this._waves[attackTurn] = wave;
    return this;
  }
  
  /**
  * Moves the attacking bees on the field
  * @param {object} colony the colony being attacked by bees
  * @param {number} time moves the bees on the given turn
  * @return {array} array of bees moving
  */ 
  invade(colony, time){
    if(this._waves[time] !== undefined){
      this._waves[time].forEach(function(bee){
        var randEntrance = Math.floor(Math.random()*colony.entrances.length);
        bee.place = colony.entrances[randEntrance];       
      });
      return this._waves[time]; //return list of new bees
    }
    else{
      return []; //no bees attacking 
    }    
  }
  
  //Creates a hive with two attacking bees
  static createTestHive() {
    var hive = new Hive(3)
              .addWave(2,1)
              .addWave(3,1);
    return hive;
  }
  
  //Creates a hive filled with attacking bees
  static createFullHive() {
    var hive = new Hive(3)
              .addWave(2,1);
    for(var i=3; i<15; i+=2){
      hive.addWave(i, 1);
    }
    hive.addWave(15,8);
    return hive;
  }
  
  //Creates a hive filled with a huge number of powerful attacking bees
  static createInsaneHive() {
    var hive = new Hive(4)
              .addWave(1,2);
    for(var i=3; i<15; i+=2){
      hive.addWave(i, 1);
    }
    hive.addWave(15,20);
    return hive;
  }  
}

/**
* Represents the game overall
*/ 
class AntGame {
  constructor(colony, hive){
    this._colony = colony;
    this._hive = hive;
    this._turn = 0;
  }
  
  /**
  * Execute the turn of the insects in the game 
  */ 
  takeTurn() {
    //all ants take a turn
    this._colony.allAnts.forEach(function(ant){
      ant.act(this._colony); //pass in colony reference if needed
    }, this);
    
    //all bees take a turn
    this._colony.allBees.forEach(function(bee){
      bee.act();
    }, this); 
    
    //new bees arrive
    this._hive.invade(this._colony, this._turn);
    
    //turn finished
    this._turn++;    
  }

  get turn() {
    return this._turn;
  }

  /**
  * Checks to see if the game is won
  * @return {boolean} true if game is won, false if lost, undefined otherwise
  */ 
  get gameWon() {
    if(this._colony.queenHasBees){ //queen has been reached
      return false; //we lost 
    }
    else if(this._colony.allBees.length + this._hive.bees.length === 0){ //no more bees!
      return true; //we won!
    } else if (this._colony.deployQueen != null) {
        if(this._colony.deployQueen.bees.length > 0) {
            return false;   
        }
    }
    return undefined; //ongoing
  }

  /**
  * Deploys an ant of the given type given by the user
  * @param {String} antType the type of ant being added
  * @param {String} placeName where to add the given ant
  * @return {object} A colony object of where to place the new ant
  */ 
  deployAnt(antType, placeName){
    try{ //brute force error catching
      var loc = placeName.split(',');
      var place = this._colony._places[loc[0]][loc[1]];
      var ant = new Ants[antType]();
      return this._colony.deployAnt(place, ant);
      //return true; //success
    }catch(e){
      return false; //error = failure
    }
  }

  //User control: remove an ant from the given place
  //@param placeName should be a String (form: "0,1" [tunnel,step])
  /**
  * Removes an ant from the place given by the user
  * @param {String} placeName where to remove the ant
  * @return {boolean} true if the ant was removed, false if there is an error
  */ 
  removeAnt(placeName){
    try { //brute force error catching
      var loc = placeName.split(',');
      var place = this._colony._places[loc[0]][loc[1]];
      place.ant.place = undefined; //take ant who was there and have him leave (circular)
      return true; //success
    }catch(e){
      return false; //error = failure
    }
  }
  
  get colony(){
    return this._colony;
  }
  
  get hive(){
    return this._hive;
  }
  
}

/*************
 * ANT TYPES *
 *************/

//an object to hold subclasses / give them specific namespaces
var Ants = {
  //Grower type: adds food per turn
  Grower : class extends Ant {
    constructor() {
      super(1,2);
      this._name = 'Grower'; 
    }
    
    act(colony) {
        colony.increaseFood(1);
    }
  },
  
  //Thrower type: deals damage to bees within a certain range
  Thrower : class extends Ant {
    constructor() {
      super(1,4);
      this._name = 'Thrower';
      this._damage = 1;
    }
  
    act() {
      var target = this.place.getClosestBee(0,3);
      if (target) {
        console.log(this + ' throws a leaf at '+target);
        target.reduceArmor(this._damage);
      }        
    }
  },
      
  //Wall type: blocks bees from moving forward      
  Wall : class extends Ant {
    constructor() {
      super(4,4);
      this._name = 'Wall';
    }
  
    act() {
        // does nothing
      }        
  },

  //Hungry type: destroys a bee in the same place, has a cooldown
  Hungry : class extends Ant {
    constructor() {
      super(1,4);
      this._name = 'Hungry';
      this._digestTime = 3;
      this._digesting = 0;
    }
  
    act() {
        if (this._digesting > 0) { //skips turn 
            this._digesting -= 1; 
        } else {
            var target = this.place.getClosestBee(0,0); 
            if (target) {
                this._digesting = this._digestTime;
                target.reduceArmor(target.armor);
                console.log(this + ' ate '+target + ' and must take ' + this._digestTime +' turns to digest');
            }
        }
    } 
  },
      
  //Fire type: deals damages to bees in the same place when destroyed
  Fire : class extends Ant {
    constructor()  {
      super(1,4);
      this._name = 'Fire';
      this._damage = 3;
    }
  
    act() {
        // does nothing
    }

     reduceArmor(amount) { 
        this._armor -= amount;
        if(this._armor <= 0){
          console.log(this.toString()+' explodes, dealing damage to nearby bees');
            while (this.place.getClosestBee(0,0) != undefined)  {
                var bee = this.place.getClosestBee(0,0);
                bee.reduceArmor(this._damage);    
            }
        this.place = undefined;
        }
      } 
  },
      
  //Scuba type: deals damages to bees within a certain range, can be placed in water
  Scuba : class extends Ant {
    constructor() {
      super(1,5);
      this._name = 'Scuba';
      this._damage = 1;
      this._watersafe = true;
    }
  
    act() {
       var target = this.place.getClosestBee(0,3);
          if (target) {
            console.log(this + ' throws a leaf at '+target);
            target.reduceArmor(this._damage);
          }  
      }        
  },
      
  //Ninja type: deals damage to passing bees, cannot block bees, nor be attacked by them
  Ninja : class extends Ant {
    constructor()  {
      super(1,6);
      this._name = 'Ninja';
      this._block = false;
      this._damage = 1;
    }
  
    act() {
      for (var i = this.place.bees.length-1; i >= 0; i--) {
          var bee = this.place.bees[i];
          bee.reduceArmor(this._damage);
          console.log(this + ' attacks ' + bee + ' from the shadows');
      }
    }        
  },
      
  //Bodyguard type: gives extra armor to an ant on the field
  Bodyguard : class extends Ant {
    constructor() {
      super(2,4);
      this._name = 'Bodyguard';
      this._container = true;
      this._contained = null;
    }
      
    //Behaves the same as the stored ant, if any
    act(colony) {
       if (this._contained != null) {
          this._contained.act(colony);   
       }
    } 
      
    //Stores an ant 
    containAnt(ant) {
        this._contained = ant;
    }
      
    //Places the stored ant on the field when out of armor, if any
    reduceArmor(amount) {
       this._armor -= amount;
          if(this._armor <= 0) {
             console.log(this.toString()+' ran out of armor and expired');
          if (this._contained != null) {
             this.place.placeContained(this._contained);
          } else {
             this.place = undefined;
          }
        }
      }
  },
     
  //Queen type: doubles the damage of nearby ants, game is over if bees reaches the queen 
  Queen : class extends Ant {
      constructor() {
          super(3,6);
          this._name = 'Queen';
          this._watersafe = true;
          this._antsDoubled = [];
          this._factor = 2;
          numberOfQueens += 1;
          this._original = true;
          if (numberOfQueens > 1) { 
              console.log('There can only be one Queen.');
              this.reduceArmor(this._armor);
          }
    }
 
    act(colony) {
        colony.newQueenPlace(this.place); //updates the colony to show both places the queen is at
        var isDoubled = false;
        if (this.place.entrance != null) { 
            if (this.place.entrance.ant) {
                var currentAnt = this.place.entrance.ant;
                for (var i = 0; i < this._antsDoubled.length; i++) { //checks to see if the ant in front has already been doubled
                    if (this._antsDoubled[i] == currentAnt) {
                        isDoubled = true;   
                    }
                }
                if (!isDoubled) {
                    currentAnt.multiplyDamage(this._factor);
                    console.log('The queen increases the damage of ' + currentAnt);
                    this._antsDoubled.push(currentAnt); 
                } 
            }
        }
        if (this.place.exit != null) {
            if (this.place.exit.ant) {
                currentAnt = this.place.exit.ant;
                 for (var i = 0; i < this._antsDoubled.length; i++) { //checks to see if the ant in the back has already been doubled
                    if (this._antsDoubled[i] == currentAnt) {
                        isDoubled = true;   
                    }
                }
                if (!isDoubled) {
                    currentAnt.multiplyDamage(this._factor);
                    console.log('The queen increases the damage of ' + currentAnt);
                    this._antsDoubled.push(currentAnt); 
                }
            } 
        } 
    }
  }
};

//export classes to be available to other modules. Note that this does expose some of the other classes
module.exports.Hive = Hive;
module.exports.AntColony = AntColony;
module.exports.AntGame = AntGame;

