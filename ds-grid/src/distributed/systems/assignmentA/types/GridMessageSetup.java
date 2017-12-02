package distributed.systems.assignmentA.types;

public class GridMessageSetup extends GridMessage {
	public GridSetup grid;
	
	public GridMessageSetup(GridSetup gridIds) {
		type = "setup";
		this.grid = gridIds;
	}
}
