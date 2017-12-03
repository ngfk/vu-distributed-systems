package distributed.systems.grid.gui;

public class GuiMessageQueue extends GuiMessage {
	public int nodeId;
	public NodeType nodeType;
	public int jobs;

	public GuiMessageQueue(int id, NodeType type, int jobs) {
		this.type = "queue";
		this.nodeId = id;
		this.nodeType = type;
		this.jobs = jobs;
	}
}
