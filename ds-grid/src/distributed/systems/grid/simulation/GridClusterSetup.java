package distributed.systems.grid.simulation;

public class GridClusterSetup {
	public String resourceManager;
	public String[] workers;

	public GridClusterSetup(String resourceManagerId, String[] workerIds) {
		this.resourceManager = resourceManagerId;
		this.workers = workerIds;
	}
}
