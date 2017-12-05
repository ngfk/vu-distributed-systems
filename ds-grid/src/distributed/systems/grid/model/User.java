package distributed.systems.grid.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import distributed.systems.grid.data.ActiveJob;
import distributed.systems.grid.simulation.SimulationContext;

/**
 * The computer that is pushing jobs to our System
 */
public class User extends GridNode {

	private List<ActiveJob> activeJobs;
	private List<Socket> schedulers;
	private int jobCount;
	
	public User(SimulationContext context, List<Socket> schedulers) {

		super(context, GridNode.TYPE.USER);

		this.activeJobs = new ArrayList<ActiveJob>();
		this.schedulers = schedulers;
		this.jobCount = 0;

		// Create jobs if configured in context, used in `StartDebug.java` for
		// testing purposes.
		for (int i = 0; i < context.getStartAutomatically(); i++) {
			Job job = new Job((int) (Math.random() * 5000));
			executeJob(job);
		}
	}

	/**
	 * Triggered from the interface.
	 */
	public void toggleState() {
		// NOOP, the user's state cannot be toggled.
		// cool story bro
	}

	/**
	 * Loop that produces the jobs.
	 * 
	 * Note: this runs in an infinite loop, with 200ms sleep.
	 */
	public void runNode() throws InterruptedException {
		// Add a new job to the system that takes up random time
		Job job = new Job((int) (Math.random() * 5000));
		executeJob(job);
		Thread.sleep(2000);
	}

	/**
	 * Should send a new job to a scheduler.
	 */
	public void executeJob(Job job) {
		Random rand = new Random();
		int schedulerId = rand.nextInt(schedulers.size());

		Socket scheduler = schedulers.get(schedulerId);
		this.activeJobs.add(new ActiveJob(job, scheduler, null));

		Message message = new Message(Message.SENDER.USER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);

		scheduler.sendMessage(message);
	}

	private void sendJobResultConfirmation(Socket scheduler, int jobId) {
		Message message = new Message(Message.SENDER.USER, Message.TYPE.CONFIRMATION, jobId, socket);
		scheduler.sendMessage(message);
	}

	/**
	 * Whenever a scheduler confirms that it received a job from the user.
	 *  - update activejob status
	 */
	private void jobConfirmationHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		aj.setStatus(Job.STATUS.RUNNING);
		this.sendQueue(jobCount++);
	}

	/**
	 * Whenever the user gets the jobresult back from the schedulers.
	 * 	- confirm to scheduler that job is received 
	 *  - Everything about this job can be deleted!
	 *  - remove job from activejobs
	 */
	private void jobResultHandler(Message message) {
		int jobId = message.getValue();
		ActiveJob aj = getActiveJob(jobId);
		sendJobResultConfirmation(message.senderSocket, jobId);
		this.activeJobs.remove(aj);
	}

	/**
	 * Types of messages we expect here:
	 * - Message from a scheduler, saying that it has accepted the job and its going to start executing
	 * - Message from a scheduler, saying that it has completed executing a job
	 */
	public void onMessageReceived(Message message) {
		if (message.getSender() == Message.SENDER.SCHEDULER) {
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				jobConfirmationHandler(message);
			}
			if (message.getType() == Message.TYPE.RESULT) {
				jobResultHandler(message);
			}
		}
	}

	// TODO detect when scheduler is down.

	/**
	 * Get activeJob by jobId
	 */
	public ActiveJob getActiveJob(int jobId) {
		for (int i = 0; i < this.activeJobs.size(); i++) {
			if (this.activeJobs.get(i).getJob().getId() == jobId) {
				return this.activeJobs.get(i);
			}
		}
		return null;
	}
}
