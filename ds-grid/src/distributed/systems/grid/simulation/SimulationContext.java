package distributed.systems.grid.simulation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import distributed.systems.grid.gui.GuiConnection;
import distributed.systems.grid.gui.NodeState;
import distributed.systems.grid.gui.NodeType;
import distributed.systems.grid.model.GridNode;
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
	 * Registers a Worker instance, the worker is added to the last resource
	 * manager that was registered.
	 * @param worker The worker
	 * @return The simulation context
	 */
	public SimulationContext register(Worker worker) {
		int index = this.resourceManagers.size() - 1;
		if (index < 0) return this;

		ResourceManager rm = this.resourceManagers.get(index);
		this.workers.get(rm.getId()).add(worker);
		return this;
	}

	/**
	 * Registers a GridNode instance, will use the correct register method
	 * depending on the node type.
	 * @param node The node
	 * @return The simulation context
	 */
	public SimulationContext register(GridNode node) {
		if (node instanceof User) {
			return this.register((User) node);
		} else if (node instanceof Scheduler) {
			return this.register((Scheduler) node);
		} else if (node instanceof ResourceManager) {
			return this.register((ResourceManager) node);
		} else if (node instanceof Worker) {
			return this.register((Worker) node);
		}

		return this;
	}

	public int getNr(GridNode node) {
		if (node instanceof Scheduler) {
			return this.schedulers.indexOf(node);
		} else if (node instanceof ResourceManager) {
			return this.resourceManagers.indexOf(node);
		} else if (node instanceof Worker) {
			for (int i = 0; i < this.resourceManagers.size(); i++) {
				ResourceManager rm = this.resourceManagers.get(i);
				List<Worker> workers = this.workers.get(rm.getId());
				int workerIdx = workers.indexOf(node);

				if (workerIdx >= 0)
					return (i * workers.size()) + workerIdx;
			}
		}

		return 0;
	}

	public void stopSimulation() {
		// TODO Trigger this from GuiConnection & dispose of the current
		// simulation
	}

	public void toggleNode(String nodeId, NodeType nodeType) {
		// TODO
		// - Create a method to find node by nodeId & nodeType
		// - Trigger this from GuiConnection
		// - Use find method to get the node & toggle it's state
	}
	
	/**
	 * Sends a 'setup' message to the connected websocket. If no socket is
	 * registered this method is a simple no-op.
	 */
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
	
	/**
	 * Sends a 'state' message to the connected websocket. If no socket is
	 * registered this method is a simple no-op.
	 * @param nodeId The id of the node that has a change in state
	 * @param nodeType The type of the node that has a change in state
	 * @param nodeState The new state of the node
	 */
	public void sendState(String nodeId, NodeType nodeType, NodeState nodeState) {
		// TODO 
		// - no-op if no connection was registered
		// - check existence of node
		// - forward to connection
	}

	/**
	 * Sends a 'queue' message to the connected websocket. If no socket is
	 * registered this method is a simple no-op.
	 * @param nodeId The id of the node that has a change in job count
	 * @param nodeType The type of the node that has a change in job count
	 * @param jobCount The new job count of the node
	 */
	public void sendQueue(String nodeId, NodeType nodeType, int jobCount) {
		// TODO 
		// - no-op if no connection was registered
		// - check existence of node
		// - forward to connection
	}
}
