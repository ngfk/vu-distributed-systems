package distributed.systems.grid.simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import distributed.systems.grid.gui.GuiConnection;
import distributed.systems.grid.gui.NodeState;
import distributed.systems.grid.gui.NodeType;
import distributed.systems.grid.model.ResourceManager;
import distributed.systems.grid.model.Scheduler;
import distributed.systems.grid.model.User;
import distributed.systems.grid.model.Worker;

/**
 * The SimulationContext class is used to hold the grid state for
 * synchronization with the interface front-end.
 */
public class SimulationContext {
	
	private GuiConnection connection;
	private Simulation simulation;
	private User user;
	private List<Scheduler> schedulers = new ArrayList<Scheduler>();
	private List<ResourceManager> resourceManagers = new ArrayList<ResourceManager>();
	private Map<String, List<Worker>> workers = new HashMap<String, List<Worker>>();
	
	/**
	 * Registers the GUI connection. Skipping this will simply run a simulation without GUI.
	 * @param connection The GUI connection
	 * @return The simulation context
	 */
	public SimulationContext register(GuiConnection connection) {
		this.connection = connection;
		return this;
	}
	
	/**
	 * Registers a Simulation instance.
	 * @param simulation The simulation
	 * @return The simulation context
	 */
	public SimulationContext register(Simulation simulation) {
		this.simulation = simulation;
		return this;
	}
	
	/**
	 * Registers a User instance.
	 * @param user The user
	 * @return The simulation context
	 */
	public SimulationContext register(User user) {
		this.user = user;
		return this;
	}
	
	/**
	 * Registers a Scheduler instance.
	 * @param scheduler The scheduler
	 * @return The simulation context
	 */
	public SimulationContext register(Scheduler scheduler) {
		this.schedulers.add(scheduler);
		return this;
	}
	
	/**
	 * Registers a ResourceManager instance.
	 * @param resourceManager The resource manager
	 * @return The simulation context
	 */
	public SimulationContext register(ResourceManager resourceManager) {
		this.resourceManagers.add(resourceManager);
		this.workers.put(resourceManager.getId(), new ArrayList<Worker>());
		return this;
	}
	
	/**
	 * Registers a Worker instance.
	 * @param resourceManager The parent resource manager
	 * @param worker The worker
	 * @return The simulation context
	 */
	public SimulationContext register(String resourceManagerId, Worker worker) {
		this.workers.get(resourceManagerId).add(worker);
		return this;
	}
	
	public void sendSetup() {
		if (this.connection == null) return;
		
		String userId = this.user.getId();

		String[] schedulerIds = new String[this.schedulers.size()];
		for (int i = 0; i < this.schedulers.size(); i++) {
			schedulerIds[i] = this.schedulers.get(i).getId();
		}
		
		GridClusterSetup[] clusterIds = new GridClusterSetup[this.resourceManagers.size()];
		for (int i = 0; i < this.resourceManagers.size(); i++) {
			ResourceManager rm = this.resourceManagers.get(i);
			List<Worker> workers = this.workers.get(rm.getId());
			if (workers == null) continue;

			String[] workerIds = new String[workers.size()];
			for (int j = 0; j < workers.size(); j++) {
				workerIds[j] = workers.get(j).getId();
			}

			GridClusterSetup clusterId = new GridClusterSetup(rm.getId(), workerIds);
			clusterIds[i] = clusterId;
		}

		this.connection.sendSetup(new GridSetup(userId, schedulerIds, clusterIds));
	}
	
	public void sendState(int nodeId, NodeType nodeType, NodeState nodeState) {
		
	}
}
