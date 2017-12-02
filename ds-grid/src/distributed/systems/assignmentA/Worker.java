package distributed.systems.assignmentA;

/**
 * Worker/Node does all the actual computations and returns the result to its
 * resource manager. Workers periodically send stillAlive messages to the
 * resourceManagers to check if they did not die.
 * 
 * OnDie: the stillAlive message will not arrive
 * 
 * OnResurrect: If a worker comes back to live, it can simply continues sending
 * the stillAlive message to the resouceManager
 */
public class Worker implements ISocketCommunicator, Runnable {
	public static enum STATUS {
		AVAILABLE, RESERVED, BUSY, DEAD // TODO DEAD.
	}

	private Socket rmSocket; // socket to access the resource manager that belongs to the worker
	private Socket socket;

	private int id; // relative to each resource manager
	STATUS status;
	private int totalExecutionTime;
	private ActiveJob activeJob;

	Worker(int id, Socket rmSocket) {
		this.id = id;
		this.rmSocket = rmSocket;
		this.totalExecutionTime = 0;
		this.status = STATUS.AVAILABLE;

		socket = new Socket(this);
		rmSocket.sendMessage(getAliveMessage());
	}

	/*
	 * ======================================================================== Send
	 * messages below
	 * =====================================================================
	 */
	/**
	 * send job confirm message to RM
	 */
	private void sendJobConfirmationToRM(Socket rmSocket, int value) {
		assert (rmSocket == this.rmSocket); // workers cannot serve another RM (should never trigger tho)
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.CONFIRMATION, value, socket);
		rmSocket.sendMessage(message);
	}

	/**
	 * send job result back to the RM
	 */
	private void sendJobResultToRM() {
		assert (activeJob != null);
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.RESULT, activeJob.job.getId(), socket);
		message.attachJob(activeJob.job);
		activeJob.scheduler.sendMessage(message);
	}

	/*
	 * ========================================================================
	 * Receive messages below
	 * =====================================================================
	 */
	/**
	 * if we receive a jobresult confirmation 
	 * - The worker node is officially done with the calculation 
	 * - update its status to the RM 
	 * - remove active job 
	 */
	private void jobResultConfirmationHandler(Message message) {
		activeJob = null;
		status = Worker.STATUS.AVAILABLE;
		rmSocket.sendMessage(getAliveMessage()); // update status to RM
	}

	/**
	 * whenever a jobrequest arives at this node 
	 * - CHECK if we already have a job
	 * 	. if we were done with that job, and we're done calculating, re-send result
	 * 	. if its another job discard it and continue 
	 * - set status to BUSY 
	 * - send confirmation to RM 
	 * TODO: 
	 * 	- start executing ... -> after x seconds send result to RM
	 */
	private void jobRequestHandler(Message message) {
		status = STATUS.BUSY;
		
		if (activeJob != null) { // edge case where the RM dies? and tries to do the same job again or so..
			if (message.getJob().getId() == activeJob.job.getId()) {
				if (activeJob.status == Job.STATUS.CLOSED) {
					sendJobResultToRM();
				}
				return; // do not need to recalculate
			}
		}

		sendJobConfirmationToRM(message.senderSocket, message.getValue());
		activeJob = new ActiveJob(message.getJob(), message.senderSocket, null); // activeJob.scheduler here is a resourceManager
		executeActiveJob();
	}

	/**
	 * Types of messages we expect here:
	 * 
	 * - From a resourceManager requesting a job computation 
	 * - From a resourceManager confirmation of a job result
	 */
	public void onMessageReceived(Message message) {
		if (message.getSender() == Message.SENDER.RESOURCE_MANAGER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				jobRequestHandler(message);
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				jobResultConfirmationHandler(message);
			}
		}
	}

	/*
	 * ========================================================================
	 * Class messages below
	 * =====================================================================
	 */
	
	/**
	 * TODO
	 */
	private void executeActiveJob() {
		activeJob.job.setResult(17);
		totalExecutionTime += 17;
		jobDoneHandler();
	}

	/**
	 * Whenever a job is finished 
	 * - set jobstatus to closed 
	 * - send result to RM 
	 * - ..await result confirmation
	 */
	private void jobDoneHandler() {
		activeJob.status = Job.STATUS.CLOSED;
		sendJobResultToRM();
	}

	private Message getAliveMessage() {
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.STATUS, status.ordinal(), socket); // enum -> int
		return message;
	}

	public Socket getSocket() {
		return socket;
	}

	/**
	 * this thread should send the aliveMessages to the RM
	 */
	public void run() {
		// TODO
	}
	
	public int getId() {
		return this.id;
	}
}
