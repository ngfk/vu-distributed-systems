package distributed.systems.grid.data;

import java.util.ArrayList;
import java.util.HashMap;

import distributed.systems.grid.model.Job;
import distributed.systems.grid.model.Socket;

public class ActiveJob {

	public static enum STATUS {
		UNCONFIRMED, CONFIRMED, DONE
	}

	Job.STATUS status; // waiting, running, closed
	Job job;
	Socket scheduler; // the scheduler that received the job

	Socket worker; // the worker that is currently responsible for this job
//	STATUS workerStatus; // the worker status

	HashMap<Socket, STATUS> schedulers;

	public ActiveJob(Job job, Socket scheduler, ArrayList<Socket> schedulers) {
		this.job = job;
		this.scheduler = scheduler;
		status = Job.STATUS.WAITING;

		if (schedulers != null) {
			this.schedulers = new HashMap<Socket, STATUS>();
			for (int i = 0; i < schedulers.size(); i++) {
				this.schedulers.put(schedulers.get(i), STATUS.UNCONFIRMED);

			}

			confirmScheduler(this.scheduler);
		}
	}

	public Job getJob() {
		return this.job;
	}

	public void setJob(Job value) {
		this.job = value;
	}

	public Socket getScheduler() {
		return this.scheduler;
	}

	public Job.STATUS getStatus() {
		return this.status;
	}

	public void setStatus(Job.STATUS value) {
		this.status = value;
	}
	
//	public void setWorkerStatus(STATUS status) {
//		this.workerStatus = status;
//	}
//	
//	public STATUS getWorkerStatus() {
//		return this.workerStatus;
//	}

	public Socket getWorker() {
		return this.worker;
	}

	public void setWorker(Socket value) {
		this.worker = value;
	}

	/* confirms that a scheduler has seeen this job */
	public void confirmScheduler(Socket scheduler) {
		schedulers.put(scheduler, STATUS.CONFIRMED);
	}

	public void markAsDone(Socket scheduler) {
		schedulers.put(scheduler, STATUS.DONE);
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
