package distributed.systems.grid.simulation;

public class GridSetup {
	public int user;
	public int[] schedulers;
	public GridClusterSetup[] clusters;

	public GridSetup(int userId, int[] schedulerIds, GridClusterSetup[] clusterIds) {
		this.user = userId;
		this.schedulers = schedulerIds;
		this.clusters = clusterIds;
	}
}
