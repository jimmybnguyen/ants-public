# Ants vs. Some-Bees

This module is a simple turn-based tower-defense game played on the command-line, completed as part of a [course](http://arch-joelross.rhcloud.com/) at the UW ISchool. 

The below questions should be answered (in detail!) regarding your submission!


##### 1. Spend some time reading through the provided code _carefully_ to make sure you understand it. After you've read the code, in the space below list any _design patterns_ we discussed in class that you can find (note that you may need to revisit the code after each lecture). Be clear about which pattern is used, where, and _why it is being employed_.
> The main design pattern being used is the composite pattern with the Insect class. This allows the game to treat all of the ants as a single object, which is useful when the bees have to damage an ant, the ant has to be placed somewhere, making the takeTurn method efficient, etc. The ants can be all sorts of different types with their own unique characteristics, but can also be treated as a basic ant when needed. Other than that, I do not think I see any other design patterns we discussed in class. 


##### 2. After you've read the code, is there anywhere that it could be re-architected (e.g., using design patterns) to be more changeable or reusable? 
> The Ant class, the Ant variable storing all of the ants, and the AntColony class can be changed to reduce with the act method. The Wall and Fire ant do not have any actions on their turns, but the act method still have to be there even if its empty. It also looks like the set place method in the Insect class works with the _addInsect and _removeInsect method in the Place class, so the coupling on that could be lower. I think a decorator pattern would be useful to allow the ants to have more states/behaviors at runtime, which would make the game more interesting. For example, giving the ants power-ups at the cost of food.

##### 3. The tunnels in the `AntColony` are structured as a ___Linked List___ (where each element is a `Place`, and the `exit` and `entrance` variables are the traditional `next` and `prev`). Why is this data structure appropriate (as opposed to, say, an array). _You may need to revisit your notes from CSE 143._
> There are only two possible directions  in the tunnels: left and right. With linked lists, the next and prev commands can be used to easily go deeper in the tunnel, or back out. A linked list also allows for all of the places in the tunnel to be connected. With an array, we can store all of the places in the tunnel, but it would require more work to connect them together in order to create the game field.


##### 4. Describe the overall architecture you used to implement the different components of this assignment. Did you use inheritance? A particular design pattern?
> Inheritance was the main design pattern I used for this assignment because it is the one I am most familiar  with. For the new ants that had to be implemented, such as the Scuba and Ninja, I used inheritance to easily create those new ants with their own special features, while also retaining the basic functionalities of an ant. I also used inheritance when creating a new Water place. 


##### 5. Specifically, discuss your use of object-oriented design patterns in your program. What patterns did you use in your implementation (be specific)? Why? Is there anywhere you explicitly decided _not_ to use a pattern (e.g., because doing so would have made it more difficult to change the code later, etc)? Be detailed---you should reflect carefully on your own design and architecture work!
> The main, and perhaps the only, design pattern I used was the inheritance pattern. As stated before, it is the pattern I am most familiar  with. However, I do believe a strategy pattern would had worked better since a strategy pattern uses composition, which provides dynamic polymorphism. I did not use any other patterns because I simply did not have the time. My plan was to get the functionality done first, and then re-architect the code later. However, all of my time spent on this assignment was simply getting the functionality down, so I was unable to implement the design patterns that were taught in class. 

>I did try to use the singleton pattern so that only have one queen on the field at any given time; however, I ran into trouble using implementing it correctly when trying to extend it with the Insect class. In the end, I decided to just use a global variable that keeps track of the number of queens placed in the game thus far. Definitely not the best solution. 

> In the end, my code has high coupling, low cohesion, and is not DRY. For example, the _addInsect in my Water class is the same as _addInsect method in the Place class, just with one if statement added. My Queen's act method is also very similar when increase the damage of the ants surrounding her. Also, I was unable to modify the Queen in a way to remove her ability to leave her current place without modifying the Place and Insect classes. 


##### 6. Approximately how many hours did it take you to complete this assignment? #####
> It took me about 30 hours to complete this assignment. Well, just the functionality part of it. 


##### 7. Did you receive help from any other sources (classmates, etc)? If so, please list who (be specific!). #####
> I received lots of help from Joel! 


##### 8. Did you encounter any problems in this assignment we should warn students about in the future? How can we make the assignment better? #####
> The bug with the foodcost method gave me a rocky start. Also, the description for the Bodyguard ant was very confusing for me, so it took me awhile to fully grasps what I had to do. To fix this, I think giving an example of a container ant, such as the Bodyguard, would make the description easier  to understand.

