package distributed.systems.assignmentA.types;

public class GridMessageQueue extends GridMessage {
	public String type = "queue";
	public int nodeId;
	public NodeType nodeType;
	public int jobs;
	
	public GridMessageQueue(int id, NodeType type, int jobs) {
		this.nodeId = id;
		this.nodeType = type;
		this.jobs = jobs;
	}
}
