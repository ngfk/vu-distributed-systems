package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * This class should initialize every other class
 * and ultimately start the simulation
 */
public class Simulation {
	private static final int NUMBER_OF_SCHEDULERS = 5;
	private static final int NUMBER_OF_RESOURCE_MANAGERS = 20;
	private static final int NUMBER_OF_WORKERS = 50; /* per resource manager */
	private static final int NUMBER_OF_USERS = 10; /* the guys that are going to use our system */
	
	private ArrayList <Scheduler> schedulers;
	private ArrayList <ResourceManager> resourceManagers;
	private ArrayList <User> users;
	
	Simulation(){
		/* create all instances */
		for (int i = 0; i < NUMBER_OF_SCHEDULERS; i++) {
			schedulers.add(new Scheduler(i));
		}
		
		for (int i = 0; i < NUMBER_OF_RESOURCE_MANAGERS; i++) {
			resourceManagers.add(new ResourceManager(i, NUMBER_OF_WORKERS));
		}
		
		for (int i = 0; i < NUMBER_OF_USERS; i++) {
			users.add(new User(i));
		}
		
	}
	
	public static void main(String[] args) {
		new Simulation();
	}
}