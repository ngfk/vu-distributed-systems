package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * A scheduler know where to find all resource managers, other schedulers, and users?
 * 
 * Requirements
 * - All scheduler communication should go through sockets 
 *
 */
public class Scheduler {

	private int id;
	private ArrayList <Job> executingJobs;
	
	
	Scheduler(int id){
		this.id = id;
	}
}
