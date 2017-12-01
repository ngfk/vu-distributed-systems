package distributed.systems.assignmentA;


/**
 * Jobbuuahh
 * 
 *
 */
public class Job {
	
	public static enum STATUS {
		WAITING,	// waiting until all schedulers have confirmed this job
		RUNNING,	// being computed
		CLOSED	// done
	}
	
	private int duration;
	private Socket user; // where the job came from, and where to send the result to.
	
	Job(int duration){
		this.duration = duration;
	}

	// TODO fix.
	public Job copy() {
		Job copyJob = new Job(duration);
		return copyJob;
	}

}
