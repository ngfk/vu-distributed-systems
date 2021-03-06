package distributed.systems.grid.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

import distributed.systems.grid.data.ActiveJob;
import distributed.systems.grid.simulation.SimulationContext;

/**
 * The entry point of a cluster
 *
 * Requirements:
 * 	Needs to hold the active jobs in some sort of way -> activeJobs
 *  Needs to know which Workers are available at all times -> through the hashmap
 *  Needs to know how to communicate with the workers -> through sockets
 *  
 * OnDie:
 * 	Whenever a resourceManager dies, no-one knows right away. I think that it is best that we detect this, in the schedulers. 
 * 	And do that by noticing that it does not send the confirmation message whenever we ask it to execute a job.
 *  Also this list of undead resourceManagers is scheduler dependent. 
 *    A.K.A every scheduler should privately keep track of which resourceManagers are alive.
 *    
 * OnResurrect:
 * 	If the resourceManager comes back to life, it might have an outdated / invalid workers list.
 *  but this will be fixed whenever the workers start sending their I am alive message again.
 */
public class ResourceManager extends GridNode {
	public static enum STATUS {
		AVAILABLE, RESERVED, BUSY, DEAD // TODO DEAD.
	}
	
	private STATUS status;
	private ArrayList<ActiveJob> activeJobs;

	/**
	 * This is an hashmap of the worker nodes
	 *  The idea is that since we cannot access the worker just by referencing their object 
	 *  We store the socket (which we use to communicate with the workers) and the status of that worker node
	 *    The resourceManager now knows at all times how to communicate with the workers, and what their status is.   
	 */
	private HashMap<Socket, Worker.STATUS> workers;

	public ResourceManager(SimulationContext context) {
		super(context, GridNode.TYPE.RESOURCE_MANAGER);

		this.status = STATUS.AVAILABLE;
		this.activeJobs = new ArrayList<ActiveJob>();
	}

	/**
	 * Triggered from the interface.
	 */
	public void toggleState() {
		this.status = this.status == STATUS.DEAD
			? STATUS.AVAILABLE
			: STATUS.DEAD;
	}

	/**
	 * The thread that checks if the workers are still alive
	 *  - WorkerOnDie -> send active job to other worker.
	 *  
	 *  TODO. check if workers are alive again
	 * 
	 * Note: this runs in an infinite loop, with 200ms sleep.
	 */
	public void runNode() {
		if (status == STATUS.DEAD) return;

		// for every active-unfinished job periodically check if the worker is still alive
		for (int i = 0; i < this.activeJobs.size(); i++) {
			if (this.activeJobs.get(i).getStatus() == Job.STATUS.RUNNING) {
				Socket worker = this.activeJobs.get(i).getWorker();
				
				// we did not hear from this guy for a loong time
				if (!worker.lastAliveIn(500L)) { // declare worker dead
					workers.put(worker, Worker.STATUS.DEAD);
					tryExecuteJob(this.activeJobs.get(i));
				}
				
				// did not hear from this worker in a slightly long time
				else if (!worker.lastAliveIn(200L)) { // request ping message
					sendPingRequestMessage(worker, this.activeJobs.get(i).getJob().getId());
				}
			}
		}
		
		// for every dead worker, check if he's alive again
		ArrayList<Socket> deadWorkers = getDeadWorkers();
		for (int i = 0; i < deadWorkers.size(); i++) {
			Socket worker = deadWorkers.get(i);
			if (!worker.lastAliveIn(10000L)) { // check if worker is alive only after long intervals
				worker.isAlive();
				sendRequestStatusMessage(worker);
			}
		}
	}

	/* ========================================================================
	 * 	Send messages below
	 * ===================================================================== */
	/**
	 * Check if the worker is still dead by sending it a status request message
	 */
	private void sendRequestStatusMessage(Socket worker) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.STATUS, 0, socket);
		worker.sendMessage(message);
	}
	
	/**
	 * confirmation message to the scheduler that it received the job correctly
	 */
	private void sendJobConfirmationToScheduler(Socket scheduler, int value) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.CONFIRMATION, value, socket);
		scheduler.sendMessage(message);
	}

	/**
	 * Request to a worker for it to start executing some code
	 */
	private void sendJobRequestToWorker(Socket worker, Job job) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.REQUEST, job.getId(), socket);
		message.attachJob(job);
		worker.sendMessage(message);
	}

	/**
	 * Confirmation to a worker that it received its result correctly
	 */
	private void sendJobResultConfirmationToWorker(Socket worker, int value) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.CONFIRMATION, value, socket);
		worker.sendMessage(message);
	}

	/**
	 * send job result back to the cluster
	 */
	private void sendJobResultToCluster(ActiveJob aj) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.RESULT, aj.getJob().getId(), socket);
		message.attachJob(aj.getJob());
		aj.getScheduler().sendMessage(message);
	}

	/**
	 * request job status from worker
	 */
	private void sendPingRequestMessage(Socket worker, int jobId) { 
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.PING, 0, socket);
		worker.sendMessage(message);
	}
	
	private void sendStatus(Socket recv) {
		if (this.status == STATUS.DEAD) return;

		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.STATUS, 1, socket);
		recv.sendMessage(message);
	}

	/* ========================================================================
	 * 	Receive messages below
	 * ===================================================================== */
	/**
	 * Whenever the worker comes back to life (or updates it status for any other reason)
	 */
	private void workerStatusHandler(Message message) {
		Socket workerSocket = message.senderSocket; // we use the socket as identifier for the worker
		Worker.STATUS newStatus = Worker.STATUS.values()[message.getValue()]; // hacky way to convert int -> enum
		workers.put(workerSocket, newStatus);
		dequeueJobHandler();
	}

	/**
	 * whenever the RM receives a jobrequest:
	 * 	- adds the job to the activeJobs list
	 *  - it confirms the request to the scheduler
	 *  - try executing the job
	 */
	private void jobRequestHandler(Message message) {
		// System.out.println(">> ResourceManager has received new job -> starting to process job");
		ActiveJob aj = new ActiveJob(message.getJob(), message.senderSocket, null);
		this.activeJobs.add(aj);
		this.sendQueue(this.activeJobs.size());
		sendJobConfirmationToScheduler(message.senderSocket, message.getValue());

		tryExecuteJob(aj);
	}

	/**
	 * When the job gets confirmed by the worker (meaning that he is going to work on it)
	 *  - update the jobstatus to RUNNING
	 *  - update lastseen of worker
	 *  - update worker to BUSY
	 */
	private void jobConfirmationHandler(Message message) {
		workers.put(message.senderSocket, Worker.STATUS.BUSY); // removes the reserved status
		ActiveJob aj = getActiveJob(message.getValue());
		aj.setStatus(Job.STATUS.RUNNING);
		message.senderSocket.isAlive(); // update alive time of worker
	}

	/**
	 * When we receive a jobresult from a worker node
	 */
	public void jobResultHandler(Message message) {
		// System.out.println("<< ResourceManager done with job");
		int jobId = message.getValue();
		ActiveJob aj = getActiveJob(jobId);
		aj.setStatus(Job.STATUS.CLOSED);
		aj.setJob(message.getJob());

		workers.put(message.senderSocket, Worker.STATUS.AVAILABLE); // set worker status to available for RM 
		sendJobResultConfirmationToWorker(message.senderSocket, jobId); // worker will update its internal status after receiving this message
		
		sendJobResultToCluster(aj);
	}

	/**
	 * When the scheduler confirms the result 
	 */
	public void jobResultConfirmationHandler(Message message) {
		int jobId = message.getValue();
		ActiveJob aj = getActiveJob(jobId);
		this.activeJobs.remove(aj);
		this.sendQueue(this.activeJobs.size());
	}
	
	/**
	 * when we receive the 'hey im still alive message from a worker'
	 *  - update the last seen status of worker
	 *  
	 *  - actually not necessary since it happens in the onMessageReceived func.
	 */
	public void jobPingResultHandler(Message message) {
		Socket worker = message.senderSocket;
		worker.isAlive();		
	}
	
	public void pingRequestHandler(Message message) {
		Socket scheduler = message.senderSocket;
		sendStatus(scheduler);
	}

	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a worker saying that he is available
	 * - Message from a worker saying that he received the Job and is going to start working on it. 
	 * - Message from a worker saying that he is done calculating and gives you back the results.
	 * - Message from a scheduler saying that he has a Job for the cluster
	 * - Message from a scheduler saying that he received the result of the Job correctly 
	 */
	public void onMessageReceived(Message message) {
		
		message.senderSocket.isAlive(); // notice that sender is still alive
		if (message.getSender() == Message.SENDER.WORKER) {
			if (message.getType() == Message.TYPE.STATUS) {
				workerStatusHandler(message);
				return;
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				jobConfirmationHandler(message);
				return;
			}
			if (message.getType() == Message.TYPE.RESULT) {
				jobResultHandler(message);
				return;
			}
			if (message.getType() == Message.TYPE.PING) {
				jobPingResultHandler(message);
				return;
			}
		}

		if (message.getSender() == Message.SENDER.SCHEDULER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				jobRequestHandler(message);
				return;
			}
			if (message.getType() == Message.TYPE.ACKNOWLEDGEMENT) {
				jobResultConfirmationHandler(message);
				return;
			}
			if (message.getType() == Message.TYPE.PING) {
				pingRequestHandler(message);
				return;
			}
		} 

		// exception
	}

	/* ========================================================================
	 * 	Class functions
	 * ===================================================================== */
	/**
	 * Whenever a worker becomes available, we should check if there is a job in queue that can be executed.
	 */
	private void dequeueJobHandler() {
		ActiveJob aj = getQueuedJob();
		if (aj == null) {
			return;
		}

		tryExecuteJob(aj);
	}

	private void tryExecuteJob(ActiveJob aj) {
		if (status == STATUS.DEAD) {
			// dead man cant jump
		}
		
		Socket availableWorker = getAvailableWorker();

		if (availableWorker == null) {
			// status remains waiting -> whenever a node worker becomes available, give him this job.
			return;
		}

		aj.setStatus(Job.STATUS.RUNNING);
		workers.put(availableWorker, Worker.STATUS.RESERVED);
		availableWorker.isAlive(); // say that this second was the last time we say the worker alive (so that it does not pollute the network too fast)
		aj.setWorker(availableWorker);
		sendJobRequestToWorker(availableWorker, aj.getJob());
	}

	private Socket getAvailableWorker() {
		for (Entry<Socket, Worker.STATUS> entry : workers.entrySet()) {
			Worker.STATUS status = entry.getValue();
			if (status == Worker.STATUS.AVAILABLE) {
				return entry.getKey();
			}
		}

		return null;
	}

	public ActiveJob getActiveJob(int jobId) {
		for (int i = 0; i < this.activeJobs.size(); i++) {
			if (this.activeJobs.get(i).getJob().getId() == jobId) {
				return this.activeJobs.get(i);
			}
		}
		return null;
	}

	public ActiveJob getQueuedJob() {
		for (int i = 0; i < this.activeJobs.size(); i++) {
			if (this.activeJobs.get(i).getStatus() == Job.STATUS.WAITING) {
				return this.activeJobs.get(i);
			}
		}
		return null;
	}

	public void setWorkerSockets(List<Socket> workers) {
		this.workers = new HashMap<Socket, Worker.STATUS>();
		for (int i = 0; i < workers.size(); i ++) {
			this.workers.put(workers.get(i), Worker.STATUS.AVAILABLE);
		}
	}
	
	public ArrayList<Socket> getDeadWorkers(){
		ArrayList<Socket> deadWorkers = new ArrayList<Socket>();
		
		for (Entry<Socket, Worker.STATUS> entry : workers.entrySet()) {
			Worker.STATUS status = entry.getValue();
			if (status == Worker.STATUS.DEAD) {
				deadWorkers.add(entry.getKey());
			}
		}
		
		return deadWorkers;
	}
}
