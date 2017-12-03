package distributed.systems.grid.gui;

public class GuiMessageState extends GuiMessage {
	public int nodeId;
	public NodeType nodeType;
	public NodeState nodeState;

	public GuiMessageState(int id, NodeType type, NodeState state) {
		this.type = "state";
		this.nodeId = id;
		this.nodeType = type;
		this.nodeState = state;
	}
}
