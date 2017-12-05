package distributed.systems.grid.model;

import distributed.systems.grid.data.ActiveJob;
import distributed.systems.grid.simulation.SimulationContext;

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
public class Worker extends GridNode implements ISocketCommunicator {
	public static enum STATUS {
		AVAILABLE, RESERVED, BUSY, DEAD // TODO DEAD.
	}
	
	private STATUS status;
	private ActiveJob activeJob;

	// maybe track this at some point
	// private int totalExecutionTime; 

	public Worker(SimulationContext context) {
		super(context, GridNode.TYPE.WORKER);

		this.status = STATUS.AVAILABLE;
		this.activeJob = null;
		// this.totalExecutionTime = 0;
	}

	/**
	 * Triggered from the interface.
	 */
	public void toggleState() {
		this.status = this.status == STATUS.DEAD
			? STATUS.AVAILABLE
			: STATUS.DEAD;
	}

	/*
	 * ======================================================================== 
	 * Send messages below
	 * =====================================================================
	 */
	private void workerStatusHandler(Socket rmSocket) {
		if (this.status == STATUS.DEAD) return;

		rmSocket.sendMessage(getAliveMessage()); // update status to RM
	}
	
	/**
	 * send job confirm message to RM
	 */
	private void sendJobConfirmationToRM(Socket rmSocket, int value) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.CONFIRMATION, value, socket);
		rmSocket.sendMessage(message);
	}

	/**
	 * send job result back to the RM
	 */
	private void sendJobResultToRM() {
		if (this.status == STATUS.DEAD) return;
		assert (activeJob != null);

		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.RESULT, activeJob.getJob().getId(), socket);
		message.attachJob(activeJob.getJob());
		activeJob.getScheduler().sendMessage(message);
	}
	
	/**
	 * Reply to the PING job status request from RM
	 */
	private void sendJobStatusToRM(Socket rmSocket) {
		if (this.status == STATUS.DEAD) return;

		int jobId = activeJob != null ? activeJob.getJob().getId() : 0;
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.PING, jobId, socket);
		rmSocket.sendMessage(message);
	}

	/*
	 * ========================================================================
	 * Receive messages below
	 * =====================================================================
	 */

	/**
	 * when the rm asks the job status (more like a 'hey are you still alive message?')
	 */
	private void jobStatusRequestHandler(Message message) {
		if (this.status == STATUS.DEAD) return;

		sendJobStatusToRM(message.senderSocket);
	}

	/**
	 * if we receive a jobresult confirmation 
	 * - The worker node is officially done with the calculation 
	 * - update its status to the RM 
	 * - remove active job 
	 */
	private void jobResultConfirmationHandler(Message message) {
		activeJob = null;
		this.sendQueue(0);
		
		if (this.status != STATUS.DEAD) {
			status = Worker.STATUS.AVAILABLE;
			// message.senderSocket.sendMessage(getAliveMessage()); // update status to RM
		}
	}

	/**
	 * whenever a jobrequest arives at this node 
	 * - set status to BUSY 
	 * - send confirmation to RM 
	 * - start executing ... -> after x seconds send result to RM
	 */
	private void jobRequestHandler(Message message) {
		System.out.println(">> Worker received job -> starting to proces Job");
		status = STATUS.BUSY;
		sendJobConfirmationToRM(message.senderSocket, message.getValue());
		activeJob = new ActiveJob(message.getJob(), message.senderSocket, null); // activeJob.scheduler here is a resourceManager
		activeJob.setStatus(Job.STATUS.RUNNING);
		this.sendQueue(1);
		executeActiveJob();
	}

	/**
	 * Types of messages we expect here:
	 * 
	 * - From a resourceManager requesting a job computation 
	 * - From a resourceManager confirmation of a job result
	 * - From the frontend toggle to dead/alive
	 */
	public void onMessageReceived(Message message) {
		if (status == STATUS.DEAD ) {
			return; //dead people cannot receive messages yo.
		}
		if (message.getSender() == Message.SENDER.RESOURCE_MANAGER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				jobRequestHandler(message);
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				jobResultConfirmationHandler(message);
			}
			if (message.getType() == Message.TYPE.PING) {
				 jobStatusRequestHandler(message);
			}
			if (message.getType() == Message.TYPE.STATUS) {
				workerStatusHandler(message.senderSocket);
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
		activeJob.getJob().setResult(17);
		
		try {
			Thread.sleep(activeJob.getJob().getDuration());
		} catch (InterruptedException e) {
			System.out.println("Worker thread: Thread sleep interrupted?");
		}
		
		jobDoneHandler();
	}

	/**
	 * Whenever a job is finished 
	 * - set jobstatus to closed 
	 * - send result to RM 
	 * - ..await result confirmation
	 */
	private void jobDoneHandler() {
		System.out.println("<< Worker done with job");
		activeJob.setStatus(Job.STATUS.CLOSED);
		sendJobResultToRM();
	}

	private Message getAliveMessage() {
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.STATUS, status.ordinal(), socket); // enum -> int
		return message;
	}
}
