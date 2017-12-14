package distributed.systems.grid.gui;

public class GuiMessageQueue extends GuiMessage {
	public String nodeId;
	public NodeType nodeType;
	public int jobs;

	public GuiMessageQueue(String id, NodeType type, int jobs) {
		this.type = "queue";
		this.nodeId = id;
		this.nodeType = type;
		this.jobs = jobs;
	}
}
