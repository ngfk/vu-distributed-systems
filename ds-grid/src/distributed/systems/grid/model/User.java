package distributed.systems.grid.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import distributed.systems.grid.data.ActiveJob;
import distributed.systems.grid.simulation.SimulationContext;

/**
 * The computer that is pushing jobs to our System
 */
public class User extends GridNode implements Runnable {

	private boolean running;
	
	private List<ActiveJob> activeJobs;
	private List<Socket> schedulers; // this should only store the active schedulers
	
	private Thread thread;

	/**
	 * Every user should at least know about 2 schedulers
	 */
	public User(SimulationContext context, List<Socket> schedulers) {
		super(context, GridNode.TYPE.SCHEDULER);

		this.running = true;
		this.activeJobs = new ArrayList<ActiveJob>();
		this.schedulers = schedulers;

		// Create jobs if configured in context, used in `StartDebug.java` for
		// testing purposes.
		for (int i = 0; i < context.getStartAutomatically(); i++) {
			Job job = new Job(8000 + (int) (Math.random() * 5000));
			executeJob(job);
		}
	}

	public void start() {
		if (this.thread != null) this.stop();
		this.running = true;
		this.thread = new Thread(this);
		this.thread.run();
	}
	
	public void stop() {
		if (this.thread == null) return;
		
		try {
			this.running = false;
			this.thread.join();
			this.thread = null;
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}

	public void toggleState() {
		// NOOP, the user's state cannot be toggled.
		// cool story bro
	}

	/* loop that produces the jobs */
	public void run() {
		while (this.running) {
			/* Add a new job to the system that take up random time */
			Job job = new Job(8000 + (int) (Math.random() * 5000));
			executeJob(job);

			try {
				Thread.sleep(2000);
			} catch (InterruptedException e) {
				assert (false) : "Simulation runtread was interrupted";
			}
		}
	}

	/**
	 * should send a new job to a scheduler
	 */
	public void executeJob(Job job) {
		Random rand = new Random();
		int schedulerId = rand.nextInt(schedulers.size());

		Socket scheduler = schedulers.get(schedulerId);
		activeJobs.add(new ActiveJob(job, scheduler, null));

		Message message = new Message(Message.SENDER.USER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);

		scheduler.sendMessage(message);
	}

	private void sendJobResultConfirmation(Socket scheduler, int jobId) {
		Message message = new Message(Message.SENDER.USER, Message.TYPE.CONFIRMATION, jobId, socket);
		scheduler.sendMessage(message);
	}

	/**
	 * whenever a scheduler confirms that it received a job from the user
	 *  - update activejob status
	 */
	private void jobConfirmationHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		aj.setStatus(Job.STATUS.RUNNING);
	}

	/**
	 * whenever the user gets the jobresult back from the schedulers.
	 * 	- confirm to scheduler that job is received 
	 *  - Everything about this job can be deleted!
	 *  - remove job from activejobs
	 *  
	 */
	private void jobResultHandler(Message message) {
		int jobId = message.getValue();
		ActiveJob aj = getActiveJob(jobId);
		sendJobResultConfirmation(message.senderSocket, jobId);
		activeJobs.remove(aj);
	}

	/**
	 * Types of messages we expect here:
	 * 
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

	//TODO detect when scheduler is down.

	/**
	 * get activeJob by jobId
	 */
	public ActiveJob getActiveJob(int jobId) {
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).getJob().getId() == jobId) {
				return activeJobs.get(i);
			}
		}
		return null;
	}
}
