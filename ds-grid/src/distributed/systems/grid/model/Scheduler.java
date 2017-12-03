package distributed.systems.grid.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.Random;

import distributed.systems.grid.data.ActiveJob;

/**
 * A scheduler know where to find all resource managers, other schedulers, and users?
 * 
 * The list of other schedulers is hard-coded
 * The list of resourceManagers is flexible
 * The list of users is flexible
 *
 */
public class Scheduler implements ISocketCommunicator {
	public static enum STATUS {
		RUNNING, DEAD
	}

	private int id;
	private Socket socket;

	private ArrayList<Socket> rmSockets; // list of all resourceManagers
	private ArrayList<ActiveJob> activeJobs; // this is a shared data-structure between schedulers 
	private HashMap<Socket, Scheduler.STATUS> schedulers; // schedulers are identified in the system by their sockets

	public Scheduler(int id, ArrayList<Socket> rmSockets) {
		this.id = id;
		this.socket = new Socket(this);
		this.rmSockets = rmSockets;

		activeJobs = new ArrayList<ActiveJob>();
	}

	public int getId() {
		return this.id;
	}

	/* a scheduler should know about all other schedulers */
	public void setSchedulers(ArrayList<Socket> schedulerSockets) {
		schedulers = new HashMap<Socket, Scheduler.STATUS>();

		for (int i = 0; i < schedulerSockets.size(); i++) {
			schedulers.put(schedulerSockets.get(i), STATUS.RUNNING);
		}
	}

	public ArrayList<Socket> getSchedulers() {
		ArrayList<Socket> list = new ArrayList<Socket>();
		list.addAll(schedulers.keySet());
		list.add(socket); // add self
		return list;
	}

	/**
	 * send a message to a scheduler, saying that we received a job.
	 */
	public void sendJobConfirmationRequestMessage(Socket scheduler, Job job) {
		if (scheduler == socket) {
			return;
		} // dont send to self
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);
		scheduler.sendMessage(message);
	}

	/**
	 * send a message to a scheduler, saying that we received the job result
	 */
	public void sendJobResultConfirmationRequestMessage(Socket scheduler, Job job) {
		if (scheduler == socket) {
			return;
		} // dont send to self
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.RESULT, job.getId(), socket);
		message.attachJob(job);
		scheduler.sendMessage(message);
	}

	/**
	 * confirm to scheduler that we noted that he has received its jobresult
	 */
	public void sendJobResultConfirmationConfirmation(Socket scheduler, int jobId) {
		if (scheduler == socket) {
			return;
		} // dont send to self
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.ACKNOWLEDGEMENT, jobId, socket);
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

	public void sendJobResultToUser(Socket user, Job job) {
		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.RESULT, job.getId(), socket);
		message.attachJob(job);
		user.sendMessage(message);
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
	}

	/**
	 * Scheduler has acknowledged that we received the results
	 */
	public void schedulerJobResultAcknowledgementHandler(Message message) {
		ActiveJob aj = getActiveJob(message.getValue());
		aj.markAsDone(message.senderSocket);

		if (aj.isDone()) {
			System.out.println("<< Schedulers done with job");
			activeJobs.remove(aj);
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
		}
	}

	/* ========================================================================
	 * 	Class functions
	 * ===================================================================== */
	public void handleExecuteJob(ActiveJob aj) {
		System.out.println(">> Scheduler got job confirmations from all other schedulers -> starting to process job");
		sendJobConfirmationToUser(aj.getJob().getUser(), aj.getJob().getId());
		executeJob(aj.getJob());
	}

	public void executeJob(Job job) {
		Random rand = new Random();
		int schedulerId = rand.nextInt(rmSockets.size());

		Socket rm = rmSockets.get(schedulerId);

		Message message = new Message(Message.SENDER.SCHEDULER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);

		rm.sendMessage(message);
	}

	public Socket getSocket() {
		return socket;
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

	public String getType() {
		return "Scheduler";
	}
}