package distributed.systems.grid.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;
import java.util.Random;

import distributed.systems.grid.data.ActiveJob;
import distributed.systems.grid.simulation.SimulationContext;

/**
 * A scheduler know where to find all resource managers, other schedulers, and users?
 * 
 * The list of other schedulers is hard-coded
 * The list of resourceManagers is flexible
 * The list of users is flexible
 */
public class Scheduler extends GridNode {
	public static enum STATUS {
		RUNNING, DEAD
	}
	
	private STATUS status;
	private List<Socket> rmSockets; // list of all resourceManagers
	private List<ActiveJob> activeJobs; // this is a shared data-structure between schedulers 
	private HashMap<Socket, Scheduler.STATUS> schedulers; // schedulers are identified in the system by their sockets

	public Scheduler(SimulationContext context, List<Socket> rmSockets) {
		super(context, GridNode.TYPE.SCHEDULER);

		this.status = STATUS.RUNNING;
		this.rmSockets = rmSockets;
		this.activeJobs = new ArrayList<ActiveJob>();
	}

	/**
	 * Triggered from the interface.
	 */
	public void toggleState() {
		this.status = this.status == STATUS.DEAD
			? STATUS.RUNNING
			: STATUS.DEAD;
	}

	/**
	 * Used during initialization, a scheduler should know about all other
	 * schedulers.
	 */
	public void setSchedulers(List<Socket> schedulerSockets) {
		this.schedulers = new HashMap<Socket, Scheduler.STATUS>();
		for (int i = 0; i < schedulerSockets.size(); i++)
			this.schedulers.put(schedulerSockets.get(i), STATUS.RUNNING);
	}

	/**
	 * Send a message to a scheduler, saying that we received a job.
	 */
	public void sendJobConfirmationRequestMessage(Socket scheduler, Job job) {
		if (status == STATUS.DEAD || scheduler == socket) return;
		
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);
		scheduler.sendMessage(message);
	}

	/**
	 * send a message to a scheduler, saying that we received the job result
	 */
	public void sendJobResultConfirmationRequestMessage(Socket scheduler, Job job) {
		if (status == STATUS.DEAD || scheduler == socket) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.RESULT, job.getId(), socket);
		message.attachJob(job);
		scheduler.sendMessage(message);
	}

	/**
	 * confirm to scheduler that we noted that he has received its jobresult
	 */
	public void sendJobResultConfirmationConfirmation(Socket scheduler, int jobId) {
		if (status == STATUS.DEAD || scheduler == socket) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.ACKNOWLEDGEMENT, jobId, socket);
		scheduler.sendMessage(message);
	}

	/**
	 * send a message to a scheduler, saying that we confirmed your received job
	 */
	public void sendJobConfirmationMessage(Socket scheduler, int jobId) {
		if (status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.CONFIRMATION, jobId, socket);
		scheduler.sendMessage(message);
	}

	/**
	 * send a request to execute a job to a resourcemanager(cluster) 
	 */
	public void sendRequestJobExecutionMessage(Socket rm, Job job) {
		if (status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);
		rm.sendMessage(message);
	}

	/**
	 * confirm to user that we have received the job
	 */
	public void sendJobConfirmationToUser(Socket user, int jobId) {
		if (status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.CONFIRMATION, jobId, socket);
		user.sendMessage(message);
	}

	public void sendJobResultToUser(Socket user, Job job) {
		if (status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.RESULT, job.getId(), socket);
		message.attachJob(job);
		user.sendMessage(message);
	}

	public void sendPingRequestMessage(Socket recv) {
		if (status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.PING, 0, socket);
		recv.sendMessage(message);
	}

	/* ========================================================================
	 * 	Receive messages below
	 * ===================================================================== */
	/**
	 * whenever a job request from an user comes in
	 */
	public void jobRequestHandler(Message message) {
		Job job = message.getJob();
		job.setUser(message.senderSocket); // sets user

		assert (!hasActiveJob(job.getId())); // job already present.. ?how why what

		ArrayList<Socket> schedulerSockets = getActiveSchedulers();
		System.out.printf(">> Scheduler has received job -> Waiting for %d scheduler confirmations\n",
				schedulerSockets.size() - 1);

		ActiveJob aj = new ActiveJob(job, socket, schedulerSockets);
		activeJobs.add(aj);
		this.sendQueue(this.activeJobs.size());

		for (Socket ss : schedulerSockets) {
			sendJobConfirmationRequestMessage(ss, job);
		}

		// edge case where there is only 1 socket here..
		if (schedulerSockets.size() == 1) {
			handleExecuteJob(aj);
		}
	}

	/**
	 * whenever another scheduler lets this scheduler know that it received a new job
	 *  - add that job to local copy of activeJobs
	 *  - sends confirmation message
	 */
	public void schedulerJobRequestHandler(Message message) {
		Job job = message.getJob();
		ActiveJob aj = new ActiveJob(job, message.senderSocket, null); // recognize that it  belongs to another scheduler, due to the socket
		activeJobs.add(aj);
		this.sendQueue(this.activeJobs.size());
		sendJobConfirmationMessage(message.senderSocket, job.getId());
	}

	/**
	 * when a job confirmation comes in from another scheduler
	 *  - check if all schedulers now have seen this job,
	 *   . if so send confirmation to the user
	 *   . and send job to resourcemanager to start computing
	 */
	public void schedulerJobConfirmationHandler(Message message) {
		Socket scheduler = message.senderSocket;
		ActiveJob aj = getActiveJob(message.getValue());
		aj.confirmScheduler(scheduler);
		if (aj.isReadyToStart()) {
			handleExecuteJob(aj);
		}
	}

	/**
	 * When the job result from the resourcemanager comes back to the scheduler
	 */
	public void schedulerJobResultHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		aj.markAsDone(socket);
		sendJobResultToUser(aj.getJob().getUser(), aj.getJob());
	}

	/**
	 * Whenever the user confirms that it received the job result
	 */
	public void userJobResultConfirmationHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		aj.setStatus(Job.STATUS.CLOSED);

		if (aj.isDone()) {
			System.out.println("<< Scheduler done with job (since we're the only schedulre)");
			activeJobs.remove(aj);
			this.sendQueue(this.activeJobs.size());
			return;
		}

		ArrayList<Socket> schedulerSockets = getActiveSchedulers();
		for (Socket ss : schedulerSockets) {
			sendJobResultConfirmationRequestMessage(ss, aj.getJob());
		}

	}

	/**
	 * whenever a scheduler says that he has received the result of a job
	 *  - remove active job (since it was not our job)
	 *  - confirm to scheduler
	 */
	public void schedulerJobResultConfirmationHandler(Message message) {
		System.out.println("<< Scheduler done tracking neighbours job");
		int jobId = message.getValue();
		ActiveJob aj = getActiveJob(jobId);
		sendJobResultConfirmationConfirmation(message.senderSocket, jobId);
		activeJobs.remove(aj);
		this.sendQueue(this.activeJobs.size());
	}

	/**
	 * Scheduler has acknowledged that we received the results
	 */
	public void schedulerJobResultAcknowledgementHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		aj.markAsDone(message.senderSocket);

		if (aj.isDone()) {
			System.out.printf("<< Schedulers done with job (todo: %d)\n", activeJobs.size() -1);
			activeJobs.remove(aj);
			this.sendQueue(this.activeJobs.size());
		}
	}

	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a scheduler, saying that it is accepting a new job
	 * - Message from a scheduler, saying that it has confirmed that this scheduler is going to start executing the job
	 * - ...
	 */
	public void onMessageReceived(Message message) {
		if (status == STATUS.DEAD){
			// cant do mahn
		}
		
		message.senderSocket.isAlive(); // notice that the sender (whoever it may be is still alive)
		if (message.getSender() == Message.SENDER.USER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				jobRequestHandler(message);
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				userJobResultConfirmationHandler(message);
			}
		}
		if (message.getSender() == Message.SENDER.SCHEDULER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				schedulerJobRequestHandler(message);
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				schedulerJobConfirmationHandler(message);
			}
			if (message.getType() == Message.TYPE.RESULT) {
				schedulerJobResultConfirmationHandler(message);
			}
			if (message.getType() == Message.TYPE.ACKNOWLEDGEMENT) {
				schedulerJobResultAcknowledgementHandler(message);
			}
		}
		if (message.getSender() == Message.SENDER.RESOURCE_MANAGER) {
			if (message.getType() == Message.TYPE.RESULT) {
				schedulerJobResultHandler(message);
			}
			if (message.getType() == Message.TYPE.STATUS) {
				// only used to register the isAlive field, but that happens at the beginning of this function :)
			}
		}
	}

	/* ========================================================================
	 * 	Class functions
	 * ===================================================================== */
	public void handleExecuteJob(ActiveJob aj) {
		System.out.println(">> Scheduler got job confirmations from all other schedulers -> starting to process job");
		sendJobConfirmationToUser(aj.getJob().getUser(), aj.getJob().getId());
		executeJob(aj);
	}

	public void executeJob(ActiveJob aj) {
		if(status != STATUS.DEAD){
			Job job = aj.getJob();
			Random rand = new Random();
			
			ArrayList<Socket> activeRmSockets = getActiveRms();
			int r = activeRmSockets.size();
			int schedulerId = rand.nextInt(r);

			Socket rm = activeRmSockets.get(schedulerId);
			aj.setRm(rm);
			aj.setStatus(Job.STATUS.RUNNING);
			
			Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
			message.attachJob(job);

			rm.sendMessage(message);
		}
	}
	
	/**
	 * the resource managers that verify that they are alive periodically 
	 */
	public ArrayList<Socket> getActiveRms(){
		ArrayList<Socket> activeRms = new ArrayList<Socket>();
		
		for (int i = 0; i < rmSockets.size(); i++) {
			Socket rmSocket = rmSockets.get(i);
			
			// TODO Revert this, and debug why the lastAlive is not good
//			if (rmSocket.lastAliveIn(200L)) {
				activeRms.add(rmSocket);
//			}
		}
		return activeRms;
	}

	public ActiveJob getActiveJob(int jobId) {
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).getJob().getId() == jobId) {
				return activeJobs.get(i);
			}
		}
		return null;
	}

	public boolean hasActiveJob(int jobId) {
		if (getActiveJob(jobId) == null) {
			return false;
		}
		return true;
	}

	/**
	 * get the un-dead schedulers
	 */
	public ArrayList<Socket> getActiveSchedulers() {
		ArrayList<Socket> activeSchedulers = new ArrayList<Socket>();
		for (Entry<Socket, STATUS> entry : schedulers.entrySet()) {
			STATUS status = entry.getValue();
			if (status == STATUS.RUNNING) {
				activeSchedulers.add(entry.getKey());
			}
		}
		assert (activeSchedulers.size() > 0);
		return activeSchedulers;
	}
	
	/**
	 * The thread that checks
	 *  - if the schedulers are still alive // TODO
	 *  - if the resourceManagers are still alive
	 * 
	 *  = SchedulerOnDie -> ?
	 *  = ResourceManagerOnDie -> ?
	 */
	public void run() {
		// TODO thread needs to be ran.. I think this should also be wrapped in a infinite loop

		// Check RM's for active jobs
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).getStatus() == Job.STATUS.RUNNING) {
				Socket rmSocket = activeJobs.get(i).getRm();
				
				if (!rmSocket.lastAliveIn(500L)) { 
					// declare rm dead
					executeJob(activeJobs.get(i));
				}
			}
		}
		
		// Update inactive RM's
		for (int i = 0; i < rmSockets.size(); i++) {
			Socket rmSocket = rmSockets.get(i);
			if (!rmSocket.lastAliveIn(200L)) {
				// Request status message // TODO
				sendPingRequestMessage(rmSocket);
			}
		}
		
		try {
			Thread.sleep(100L);
		} catch (InterruptedException e) {
			assert (false) : "Simulation runtread was interrupted";
		}
	}
}
