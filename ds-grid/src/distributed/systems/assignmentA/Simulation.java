package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * This class should initialize every other class and ultimately start the
 * simulation
 */
public class Simulation {
	private static final int NUMBER_OF_SCHEDULERS = 5;
	private static final int NUMBER_OF_RESOURCE_MANAGERS = 2;
	private static final int NUMBER_OF_WORKERS = 5; /* per resource manager */
	private static final int NUMBER_OF_USERS = 10; /* the guys that are going to use our system */

	/* keep this info to make debug-life slightly easier */
	private ArrayList<Scheduler> schedulers;
	private ArrayList<ResourceManager> resourceManagers;
	private ArrayList<User> users;
	
	/* WebSocket Server */
	private Thread webSocketServerThread;
	
	/**
	 * TODO this should not happen here..
	 * there will be a front-end interface where you can create all of these.
	 * And whenver you press run, the users will start sending jobs to the clusters.
	 */
	Simulation() {
		ArrayList<Socket> schedulerSockets = new ArrayList<Socket>();
		
		schedulers = new ArrayList<Scheduler>();
		for (int i = 0; i < NUMBER_OF_SCHEDULERS; i++) {
			Scheduler newScheduler = new Scheduler(i);
			schedulers.add(newScheduler);
			schedulerSockets.add(newScheduler.getSocket());
		}
		/* let the schedulers know about eachother */
		for (int i = 0; i < schedulers.size(); i++) {
			schedulers.get(i).setSchedulers(schedulerSockets);
			
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
			// TODO: fix this.
			users.add(new User(i, schedulers.get(0).getSocket(), schedulers.get(1).getSocket()));
		}
		
		/* Create the WebSocketServer thread */
		webSocketServerThread = new Thread(new WebSocketServer());
		webSocketServerThread.start();
	}

	public static void main(String[] args) {
		new Simulation();
	}
}