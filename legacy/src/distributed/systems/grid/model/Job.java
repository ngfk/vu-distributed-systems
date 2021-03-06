package distributed.systems.grid.model;

import java.util.Random;

/**
 * Jobbuuahh
 */
public class Job {
	public static enum STATUS {
		WAITING, // waiting until all schedulers have confirmed this job
		RUNNING, // being computed
		CLOSED // done
	}

	private int duration;
	private Socket user; // where the job came from, and where to send the result to.
	private int id;
	private int result;

	Job(int duration) {
		this.duration = duration;

		Random ran = new Random();
		this.id = ran.nextInt(Integer.MAX_VALUE);
	}

	Job(Job job) {
		this.duration = job.duration;
		this.id = job.id;
		this.user = job.user;
		this.result = job.result;
	}

	public Job copy() {
		Job copyJob = new Job(this);
		return copyJob;
	}

	public int getId() {
		return id;
	}
	
	public int getDuration() {
		return duration;
	}

	public Socket getUser() {
		return user;
	}

	public void setUser(Socket user) {
		this.user = user;
	}

	public void setResult(int result) {
		this.result = result;
	}
}
