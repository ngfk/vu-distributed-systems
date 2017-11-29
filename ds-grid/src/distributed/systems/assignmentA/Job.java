package distributed.systems.assignmentA;


/**
 * Jobbuuahh
 * 
 *
 */
public class Job {
	
	public static enum STATUS {
		OPEN,
		TAKEN,
		CLOSED
	}
	
	private int duration;
	private STATUS status;
	
	Job(int duration){
		this.duration = duration;
	}
	
	public Job copy() {
		Job copyJob = new Job(duration);
		copyJob.setStatus(status);
		return copyJob;
	}
	
	public void setStatus(STATUS status) {
		this.status = status;
	}
}
