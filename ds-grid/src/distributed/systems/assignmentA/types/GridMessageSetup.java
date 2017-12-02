package distributed.systems.assignmentA.types;

public class GridMessageSetup extends GridMessage {
	public String type = "setup";
	public GridSetup grid;
	
	public GridMessageSetup(GridSetup gridIds) {
		this.grid = gridIds;
	}
}
