package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * This class should initialize every other class
 * and ultimately start the simulation
 */
public class Simulation {
	private static final int NUMBER_OF_SCHEDULERS = 5;
	private static final int NUMBER_OF_RESOURCE_MANAGERS = 20;
	private static final int NUMBER_OF_WORKER_NODES = 50; /* per resource manager */
	
	private ArrayList <Scheduler> schedulers;
	
	Simulation(){
		/* create all instances */
		for (int i = 0; i < NUMBER_OF_SCHEDULERS; i++) {
			schedulers.add(new Scheduler(i));
		}
	}
	
	public static void main(String[] args) {
		new Simulation();
	}
}