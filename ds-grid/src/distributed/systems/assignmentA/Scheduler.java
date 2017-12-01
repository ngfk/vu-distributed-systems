package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;

/**
 * A scheduler know where to find all resource managers, other schedulers, and users?
 * 
 * The list of other schedulers is hard-coded
 * The list of resourceManagers is flexible
 * The list of users is flexible
 *
 */
public class Scheduler implements ISocketCommunicator{
	public static enum STATUS {
		RUNNING,
		DEAD
	}
	private int id;
	private Socket socket;
	
	private ArrayList <ActiveJob> activeJobs; // this is a shared data-structure between schedulers 
	
	private HashMap<Socket, Scheduler.STATUS> schedulers; // schedulers are identified in the system by their sockets
	
	
	Scheduler(int id){
		this.id = id;
		socket = new Socket(this);
	}
	
	/* a scheduler should know about all other schedulers */
	public void setSchedulers(ArrayList<Socket> schedulerSockets) {
		schedulers = new HashMap<Socket,Scheduler.STATUS>();
		schedulers.put(socket, STATUS.RUNNING);
	}
	
	public ArrayList<Socket> getSchedulers(){
		ArrayList<Socket> list = new ArrayList<Socket>();
		list.addAll(schedulers.keySet());
		list.add(socket); // add self
		return list;
	}

	/**
	 * send a message to a scheduler, saying that we received a job.
	 */
	public void sendJobConfirmationRequestMessage(Socket scheduler, Job job) {
		if (scheduler == socket) { return; } // dont send to self
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);
		scheduler.sendMessage(message);
	}
	
	/**
	 * send a message to a scheduler, saying that we confirmed your received job
	 */
	public void sendJobConfirmationMessage(Socket scheduler, int jobId) {
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.CONFIRMATION, jobId, socket);
		scheduler.sendMessage(message);
	}
	
	/**
	 * send a request to execute a job to a resourcemanager(cluster) 
	 */
	public void sendRequestJobExecutionMessage(Socket rm, Job job) {
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);
		rm.sendMessage(message);
	}
	
	/**
	 * confirm to user that we have received the job
	 */
	public void sendJobConfirmationToUser(Socket user, int jobId) {
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.CONFIRMATION, jobId, socket);
		user.sendMessage(message);
	}
	/* ========================================================================
	 * 	Receive messages below
	 * ===================================================================== */
	/**
	 * whenever a job request from an user comes in
	 */
	public void jobRequestHandler(Job job) {
		assert (!hasActiveJob(job.getId())); // job already present.. ?how why what
		
		ArrayList<Socket> schedulerSockets = getActiveSchedulers();
		ActiveJob aj = new ActiveJob(job, socket, schedulerSockets);
		activeJobs.add(aj);
		
		for (Socket ss : schedulerSockets) {
			sendJobConfirmationRequestMessage(ss, job);
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
			sendJobConfirmationToUser(message.senderSocket, aj.job.getId());
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
		if (message.getSender() == Message.SENDER.USER) {
			if (message.getType() == Message.TYPE.REQUEST) {
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
			}
		}
		if (message.getSender() == Message.SENDER.SCHEDULER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				schedulerJobRequestHandler(message);
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				schedulerJobConfirmationHandler(message);
			}
		}
	}
	
	/* ========================================================================
	 * 	Class functions
	 * ===================================================================== */		
	public Socket getSocket() {
		return socket;
	}

	public ActiveJob getActiveJob(int jobId) {
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).job.getId() == jobId) {
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
	
	public ArrayList<Socket> getActiveSchedulers(){
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
}
