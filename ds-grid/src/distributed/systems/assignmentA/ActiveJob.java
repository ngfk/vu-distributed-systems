package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.HashMap;

public class ActiveJob {
	
	public static enum STATUS {
		UNCONFIRMED,
		CONFIRMED,
		DONE
	}
	
	Job.STATUS status; // waiting, running, closed
	Job job;
	Socket scheduler; // the scheduler that received the job
	
	Socket worker; // the worker that is currently responsible for this job
	
	HashMap<Socket, STATUS> schedulers;
	
	ActiveJob(Job job, Socket scheduler, ArrayList<Socket> schedulers){
		this.job = job;
		this.scheduler = scheduler;
		status = Job.STATUS.WAITING;
		
		if (schedulers != null) {
			this.schedulers = new HashMap<Socket, STATUS>();
			for (int i = 0; i < schedulers.size(); i ++ ) {
				this.schedulers.put(schedulers.get(i), STATUS.UNCONFIRMED);
			
			
			}
			
			confirmScheduler(this.scheduler);
		}	
	}
	
	/* confirms that a scheduler has seeen this job */
	public void confirmScheduler(Socket scheduler) {
		schedulers.put(scheduler, STATUS.CONFIRMED);
	}
	
	public void markAsDone(Socket scheduler) {
		schedulers.put(scheduler, STATUS.DONE);
	}
	
	public void setWorker(Socket worker) {
		this.worker = worker;
	}
	
	/* I think we can only start (for now) whenever all schedulers have seen the confirmation */
	public boolean isReadyToStart() {
		ArrayList<STATUS> statusses = new ArrayList<STATUS>();
		statusses.addAll(schedulers.values());
		
		for (int i = 0; i < statusses.size(); i++) {
			if (statusses.get(i) == STATUS.UNCONFIRMED) {
				return false;
			}
		}
		return true;
	}
	
	
	/* whenever the activeJob does not reside on any other scheduler nomore */
	public boolean isDone() {
		ArrayList<STATUS> statusses = new ArrayList<STATUS>();
		statusses.addAll(schedulers.values());
		
		for (int i = 0; i < statusses.size(); i++) {
			if (statusses.get(i) != STATUS.DONE) {
				return false;
			}
		}
		return true;
	}
}
