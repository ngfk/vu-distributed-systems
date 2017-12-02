package distributed.systems.assignmentA.types;

public class GridMessageState extends GridMessage {
	public String type = "state";
	public int nodeId;
	public NodeType nodeType;
	public NodeState nodeState;
	
	public GridMessageState(int id, NodeType type, NodeState state) {
		this.nodeId = id;
		this.nodeType = type;
		this.nodeState = state;
	}
}
