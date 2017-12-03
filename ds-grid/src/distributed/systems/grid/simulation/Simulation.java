package distributed.systems.grid.simulation;

import java.util.ArrayList;
import java.util.List;

import distributed.systems.grid.model.ResourceManager;
import distributed.systems.grid.model.Scheduler;
import distributed.systems.grid.model.Socket;
import distributed.systems.grid.model.User;
import distributed.systems.grid.model.Worker;

/**
 * This class should initialize every other class and ultimately start the
 * simulation
 */
public class Simulation {
	
	private SimulationContext context;
	
	public Simulation(SimulationContext context, int schedulerCount, int clusterCount, int workerCount) {
		this.context = context.register(this);
		
		List<Socket> schedulerSockets = new ArrayList<Socket>();
		List<Socket> rmSockets = new ArrayList<Socket>();

		List<ResourceManager> resourceManagers = new ArrayList<ResourceManager>();
		for (int i = 0; i < clusterCount; i++) {
			List<Socket> workerSockets = new ArrayList<Socket>();
			ArrayList<Worker> workers = new ArrayList<Worker>();
			
			for (int j = 0; j < workerCount; j++) {
				Worker worker = new Worker(this.context);
				
			}
			
			ResourceManager newResourceManager = new ResourceManager(this.context, workerSockets);
			newResourceManager.setWorkers(workers); // only for GUI
			resourceManagers.add(newResourceManager);
			
			Socket rmSocket = newResourceManager.getSocket();
			rmSockets.add(rmSocket);
		}

		List<Scheduler> schedulers = new ArrayList<Scheduler>();
		for (int i = 0; i < schedulerCount; i++) {
			Scheduler newScheduler = new Scheduler(this.context, rmSockets);
			schedulers.add(newScheduler);
			schedulerSockets.add(newScheduler.getSocket());
		}
		
		/* let the schedulers know about eachother */
		for (int i = 0; i < schedulers.size(); i++) {
			schedulers.get(i).setSchedulers(schedulerSockets);
		}

		System.out.printf(">> Done with initializing all nodes\n");
		new User(this.context, schedulerSockets);
		this.context.sendSetup();
	}

	public void start() {
		this.context.stopSimulation();
	}

	public void stop() {
		this.context.stopSimulation();
	}
}
