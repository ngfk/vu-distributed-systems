package distributed.systems.grid.simulation;

public class GridClusterSetup {
	public int resourceManager;
	public int[] workers;

	public GridClusterSetup(int resourceManagerId, int[] workerIds) {
		this.resourceManager = resourceManagerId;
		this.workers = workerIds;
	}
}
