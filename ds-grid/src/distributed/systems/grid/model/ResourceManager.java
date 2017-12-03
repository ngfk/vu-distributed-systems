package distributed.systems.grid.model;

import java.util.ArrayList;
import java.util.HashMap;
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
public class ResourceManager extends GridNode implements Runnable {
	public static enum STATUS {
		AVAILABLE, RESERVED, BUSY, DEAD // TODO DEAD.
	}
	
	public ArrayList<Worker> workerObjects; // this is only to help drawing the interface!
	private ArrayList<ActiveJob> activeJobs;

	private STATUS status;
	
	/**
	 * This is an hashmap of the worker nodes
	 *  The idea is that since we cannot access the worker just by referencing their object 
	 *  We store the socket (which we use to communicate with the workers) and the status of that worker node
	 *    The resourceManager now knows at all times how to communicate with the workers, and what their status is.   
	 */
	private HashMap<Socket, Worker.STATUS> workers;

	public ResourceManager(SimulationContext context, int numberOfWorkers) {
		super(context, GridNode.TYPE.RESOURCE_MANAGER);

		this.status = STATUS.AVAILABLE;
		this.workers = new HashMap<Socket, Worker.STATUS>();
		this.activeJobs = new ArrayList<ActiveJob>();
		this.workerObjects = new ArrayList<Worker>();
	}

	public void toggleState() {
		if (this.status == STATUS.DEAD) {
			this.status = STATUS.AVAILABLE;
		} else {
			this.status = STATUS.DEAD;
		}
	}

	/* ========================================================================
	 * 	Send messages below
	 * ===================================================================== */
	/**
	 * confirmation message to the scheduler that it received the job correctly
	 */
	private void sendJobConfirmationToScheduler(Socket scheduler, int value) {
		if (status != STATUS.DEAD ) {
			Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.CONFIRMATION, value, socket);
			scheduler.sendMessage(message);
		}
	}

	/**
	 * Request to a worker for it to start executing some code
	 */
	private void sendJobRequestToWorker(Socket worker, Job job) {
		if (status != STATUS.DEAD ) {
			Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.REQUEST, job.getId(), socket);
			message.attachJob(job);
			worker.sendMessage(message);
		}
	}

	/**
	 * Confirmation to a worker that it received its result correctly
	 */
	private void sendJobResultConfirmationToWorker(Socket worker, int value) {
		if (status != STATUS.DEAD ) {
			Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.CONFIRMATION, value, socket);
			worker.sendMessage(message);
		}
	}

	/**
	 * send job result back to the cluster
	 */
	private void sendJobResultToCluster(ActiveJob aj) {
		if (status != STATUS.DEAD ) {
			Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.RESULT, aj.getJob().getId(),
				socket);
			message.attachJob(aj.getJob());
			aj.getScheduler().sendMessage(message);
		}
	}

	/**
	 * request job status from worker
	 */
	private void sendPingRequestMessage(Socket worker, int jobId) { 
		if (status != STATUS.DEAD ) {
			Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.PING, 0, socket);
			worker.sendMessage(message);
		}
	}

	/* ========================================================================
	 * 	Receive messages below
	 * ===================================================================== */
	/**
	 * onMessageReceive handler (1)
	 * NOTE also adds the worker to the resourceManager if it was not already in there :-)
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
		System.out.println(">> ResourceManager has received new job -> starting to process job");
		ActiveJob aj = new ActiveJob(message.getJob(), message.senderSocket, null);
		activeJobs.add(aj);
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
		System.out.println("<< ResourceManager done with job");
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
		activeJobs.remove(aj);
	}
	
	/**
	 * when we receive the 'hey im still alive message from a worker'
	 *  - update the last seen status of worker
	 */
	public void jobPingResultHandler(Message message) {
		Socket worker = message.senderSocket;
		worker.isAlive();		
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
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				jobResultConfirmationHandler(message);
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
		if (status != STATUS.DEAD) {
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
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).getJob().getId() == jobId) {
				return activeJobs.get(i);
			}
		}
		return null;
	}

	public ActiveJob getQueuedJob() {
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).getStatus() == Job.STATUS.WAITING) {
				return activeJobs.get(i);
			}
		}
		return null;
	}

	public void addWorker(Worker worker) {
		workerObjects.add(worker);
	}

	public ArrayList<Worker> getWorkers() {
		return workerObjects;
	}

	/**
	 * The thread that checks if the workers are still alive
	 *  - WorkerOnDie -> send active job to other worker.
	 */
	public void run() {
		// for every active-unfinished job periodically check if the worker is still alive
		if (status != STATUS.DEAD ) {
			for (int i = 0; i < activeJobs.size(); i++) {
				if (activeJobs.get(i).getStatus() == Job.STATUS.RUNNING) {
					Socket worker = activeJobs.get(i).getWorker();
					
					// we did not hear from this guy for a loong time
					if (!worker.lastAliveIn(500L)) { // declare worker dead
						workers.put(worker, Worker.STATUS.DEAD);
						tryExecuteJob(activeJobs.get(i));
					}
					
					// did not hear from this worker in a slightly long time
					else if (!worker.lastAliveIn(200L)) { // request ping message
						sendPingRequestMessage(worker, activeJobs.get(i).getJob().getId());
					}
				}
			}
			try {
				Thread.sleep(100L);
			} catch (InterruptedException e) {
				assert (false) : "Simulation runtread was interrupted";
			}
		}
	}
}
