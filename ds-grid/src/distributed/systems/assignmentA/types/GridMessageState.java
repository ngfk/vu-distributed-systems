package distributed.systems.assignmentA.types;

public class GridMessageState extends GridMessage {
	public int nodeId;
	public NodeType nodeType;
	public NodeState nodeState;
	
	public GridMessageState(int id, NodeType type, NodeState state) {
		this.type = "state";
		this.nodeId = id;
		this.nodeType = type;
		this.nodeState = state;
	}
}
