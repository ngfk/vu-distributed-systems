package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * This class should initialize every other class and ultimately start the
 * simulation
 */
public class Simulation {
	private static final int NUMBER_OF_SCHEDULERS = 5;
	private static final int NUMBER_OF_RESOURCE_MANAGERS = 20;
	private static final int NUMBER_OF_WORKERS = 50; /* per resource manager */
	private static final int NUMBER_OF_USERS = 10; /* the guys that are going to use our system */

	/* keep this info to make debug-life slightly easier */
	private ArrayList<Scheduler> schedulers;
	private ArrayList<ResourceManager> resourceManagers;
	private ArrayList<User> users;

	Simulation() {
		schedulers = new ArrayList<Scheduler>();
		/* create all instances */
		for (int i = 0; i < NUMBER_OF_SCHEDULERS; i++) {
			schedulers.add(new Scheduler(i));
		}

		resourceManagers = new ArrayList<ResourceManager>();
		for (int i = 0; i < NUMBER_OF_RESOURCE_MANAGERS; i++) {
			ResourceManager newResourceManager = new ResourceManager(i, NUMBER_OF_WORKERS);
			resourceManagers.add(newResourceManager);
			Socket rmSocket = newResourceManager.getSocket();

			/**
			 * We create all of the worker nodes here, On init, the worker nodes will let
			 * the resourceManager know that they're available
			 */
			for (int j = 0; j < NUMBER_OF_WORKERS; j++) {
				new Worker(j, rmSocket);
			}
		}

		users = new ArrayList<User>();
		for (int i = 0; i < NUMBER_OF_USERS; i++) {
			users.add(new User(i, schedulers.get(0).getSocket(), schedulers.get(1).getSocket()));
		}
	}

	public static void main(String[] args) {
		new Simulation();
	}
}