package distributed.systems.grid.gui;

import distributed.systems.grid.simulation.GridSetup;

public class GuiMessageSetup extends GuiMessage {
	public GridSetup grid;

	public GuiMessageSetup(GridSetup gridIds) {
		this.type = "setup";
		this.grid = gridIds;
	}
}
