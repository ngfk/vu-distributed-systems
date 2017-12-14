package distributed.systems.grid.simulation;

public class GridSetup {
	public String user;
	public String[] schedulers;
	public GridClusterSetup[] clusters;

	public GridSetup(String userId, String[] schedulerIds, GridClusterSetup[] clusterIds) {
		this.user = userId;
		this.schedulers = schedulerIds;
		this.clusters = clusterIds;
	}
}
