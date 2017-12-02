package distributed.systems.assignmentA.types;

public class GridMessageInit extends GridMessage {
	public String type = "init"; 
	public GridMessageInitSizes sizes;
	
	public GridMessageInit(int schedulerCount, int clusterCount, int workerCount) {
		this.sizes = new GridMessageInitSizes();
		this.sizes.schedulers = schedulerCount;
		this.sizes.clusters = clusterCount;
		this.sizes.workers = workerCount;
	}
}
