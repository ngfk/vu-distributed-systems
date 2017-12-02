package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.Random;

/**
 * The computer that is pushing jobs to our System
 */
public class User implements ISocketCommunicator, Runnable {
	public static enum STATUS {
			IDLE,
			RUNNING
	}
	
	private int id;
	private STATUS status;
	private Socket socket;
	
	private ArrayList<ActiveJob> activeJobs; 
	private ArrayList<Socket> schedulers; // this should only store the active schedulers
	
	/**
	 * Every user should at least know about 2 schedulers
	 */
	User(int id, ArrayList<Socket> schedulers){
		this.id = id;
		socket = new Socket(this);
		
		this.schedulers = schedulers;
		activeJobs = new ArrayList<ActiveJob>();
		
		Job job = new Job(8000 + (int)(Math.random() * 5000));
		executeJob(job);
		System.out.println("done? ");
	}

	private void requestSchedulerList() {
		// TODO it should actually first verify wether the scheduler is up.. and maybe store somewhere the statusses of these schedulers.
		schedulers.get(0).sendMessage(getSchedulersMessage()); // the result will come in at the onMessageReceived function
	}
	
	/**
	 * request new scheduler list
	 *  asks to a scheduler a new list of schedulers
	 */
	private void updateSchedulers() {
		// TODO send request schedulers message to a scheduler.
	}
	
	public int getId() {
		return this.id;
	}

	/* loop that produces the jobs */
	public void run() {
		while (true) {
			/* Add a new job to the system that take up random time */
			Job job = new Job(8000 + (int)(Math.random() * 5000));
			executeJob(job);
			
			try {
				Thread.sleep(100L);
			} catch (InterruptedException e) {
				assert(false) : "Simulation runtread was interrupted";
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
	
	private Message getSchedulersMessage() {
		return new Message(Message.SENDER.USER, Message.TYPE.REQUEST, 0, socket);
	}

	/**
	 * whenever a scheduler confirms that it received a job from the user
	 *  - update activejob status
	 */
	private void jobConfirmationHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		assert(aj != null);
		aj.status = Job.STATUS.RUNNING;
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
			if (message.getType() == Message.TYPE.CONFIRMATION) {
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
			if (activeJobs.get(i).job.getId() == jobId) {
				return activeJobs.get(i);
			}
		}
		return null;
	}
	
}
