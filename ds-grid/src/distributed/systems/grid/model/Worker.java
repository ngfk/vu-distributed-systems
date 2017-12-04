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
	
//	private Socket rmSocket; // socket to access the resource manager that belongs to the worker

	STATUS status;
	private int totalExecutionTime; // maybe track this at some point
	private ActiveJob activeJob;

	public Worker(SimulationContext context) {
		super(context, GridNode.TYPE.WORKER);
//		this.rmSocket = rmSocket;
		this.totalExecutionTime = 0;
		this.status = STATUS.AVAILABLE;
//		rmSocket.sendMessage(getAliveMessage());
	}

	public void toggleState() {
		if (this.status == STATUS.DEAD) {
			this.status = STATUS.AVAILABLE;
		} else {
			this.status = STATUS.DEAD;
		}
	}

	/*
	 * ======================================================================== 
	 * Send messages below
	 * =====================================================================
	 */
	private void workerStatusHandler(Socket rmSocket) {
		if (this.status != STATUS.DEAD);{
			rmSocket.sendMessage(getAliveMessage()); // update status to RM
		}
	}
	
	/**
	 * send job confirm message to RM
	 */
	private void sendJobConfirmationToRM(Socket rmSocket, int value) {
		if (this.status != STATUS.DEAD){
			Message message = new Message(Message.SENDER.WORKER, Message.TYPE.CONFIRMATION, value, socket);
			rmSocket.sendMessage(message);
		}
	}

	/**
	 * send job result back to the RM
	 */
	private void sendJobResultToRM() {
		assert (activeJob != null);
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.RESULT, activeJob.getJob().getId(), socket);
		if (this.status != STATUS.DEAD){
			message.attachJob(activeJob.getJob());
			activeJob.getScheduler().sendMessage(message);
		}
	}
	
	/**
	 * Reply to the PING job status request from RM
	 */
	private void sendJobStatusToRM(Socket rmSocket) {
		int jobId = 0;
		if (activeJob != null) {
			jobId = activeJob.getJob().getId();
		}
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
		if (this.status != STATUS.DEAD){
			sendJobStatusToRM(message.senderSocket);
		}
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
//			message.senderSocket.sendMessage(getAliveMessage()); // update status to RM
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
		System.out.println("<< Worker done with job");
		activeJob.setStatus(Job.STATUS.CLOSED);
		sendJobResultToRM();
	}

	private Message getAliveMessage() {
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.STATUS, status.ordinal(), socket); // enum -> int
		return message;
	}
}
