package distributed.systems.assignmentA;

import java.util.ArrayList;

import distributed.systems.assignmentA.types.GridClusterSetup;
import distributed.systems.assignmentA.types.GridSetup;

/**
 * This class should initialize every other class and ultimately start the
 * simulation
 */
public class Simulation {
	private ArrayList<Scheduler> schedulers;
	private ArrayList<ResourceManager> resourceManagers;
	private ArrayList<User> users;

	Simulation(int schedulerCount, int clusterCount, int workerCount) {
		ArrayList<Socket> schedulerSockets = new ArrayList<Socket>();
		ArrayList<Socket> rmSockets = new ArrayList<Socket>();
	
		resourceManagers = new ArrayList<ResourceManager>();
		for (int i = 0; i < clusterCount; i++) {
			ResourceManager newResourceManager = new ResourceManager(i, workerCount);
			resourceManagers.add(newResourceManager);
			Socket rmSocket = newResourceManager.getSocket();
			rmSockets.add(rmSocket);

			// We create all of the worker nodes here, On init, the worker
			// nodes will let the resourceManager know that they're available
			for (int j = 0; j < workerCount; j++) {
				Worker worker = new Worker(j, rmSocket);
				newResourceManager.addWorker(worker);
			}
		}
		
		schedulers = new ArrayList<Scheduler>();
		for (int i = 0; i < schedulerCount; i++) {
			Scheduler newScheduler = new Scheduler(i, rmSockets);
			schedulers.add(newScheduler);
			schedulerSockets.add(newScheduler.getSocket());
		}
		/* let the schedulers know about eachother */
		for (int i = 0; i < schedulers.size(); i++) {
			schedulers.get(i).setSchedulers(schedulerSockets);
		}
		
		System.out.printf("Done with init\n");

		// TODO Might support multiple users in a simulation.
		users = new ArrayList<User>();
		for (int i = 0; i < 1; i++) {
			users.add(new User(i, schedulerSockets));
		}
	}

	public GridSetup getGridSetup() {
		GridClusterSetup[] clusterIds = new GridClusterSetup[this.resourceManagers.size()];
		for (int i = 0; i < this.resourceManagers.size(); i++) {
			ResourceManager rm = this.resourceManagers.get(i);
			ArrayList<Worker> workers = rm.getWorkers();
			
			int[] workerIds = new int[workers.size()];
			for (int j = 0; j < workers.size(); j++) {
				workerIds[j] = workers.get(j).getId();
			}
			
			GridClusterSetup clusterId = new GridClusterSetup(rm.getId(), workerIds);
			clusterIds[i] = clusterId;
		}
		
		int[] schedulerIds = new int[this.schedulers.size()];
		for (int i = 0; i < this.schedulers.size(); i++) {
			schedulerIds[i] = this.schedulers.get(i).getId();
		}
		
		int userId = this.users.get(0).getId();
		
		return new GridSetup(userId, schedulerIds, clusterIds);
	}
}
