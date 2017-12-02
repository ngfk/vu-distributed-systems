package distributed.systems.assignmentA.types;

public class GridMessageToggle extends GridMessage {
	public String type = "toggle";
	public int nodeId;
	public NodeType nodeType;
	
	public GridMessageToggle(int id, NodeType type) {
		this.nodeId = id;
		this.nodeType = type;
	}
}
