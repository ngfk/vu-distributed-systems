package distributed.systems.assignmentA;


/**
 * Worker/Node does all the actual computations and returns the result to its resource manager.
 *
 */
public class Worker {
	public static final int AVAILABLE = 0;
	public static final int BUSY = 1;
	public static final int DEAD = 2;
	
	private int id; // relative to each resource manager
	
	Worker(int id){
		this.id = id;
	}
}
