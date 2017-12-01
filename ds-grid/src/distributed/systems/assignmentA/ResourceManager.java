package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map.Entry;

import distributed.systems.assignmentA.Scheduler.STATUS;

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
public class ResourceManager implements ISocketCommunicator {
	private int id;
	
	private Socket socket;
	private ArrayList<ActiveJob> activeJobs; 
	
	/**
	 * This is an hashmap of the worker nodes
	 *  The idea is that since we cannot access the worker just by referencing their object 
	 *  We store the socket (which we use to communicate with the workers) and the status of that worker node
	 *    The resourceManager now knows at all times how to communicate with the workers, and what their status is.   
	 */
	private HashMap<Socket, Worker.STATUS> workers;
	
	ResourceManager(int id, int numberOfWorkers){
		this.id = id;
		socket = new Socket(this);
		
		workers = new HashMap<Socket,Worker.STATUS>();
		activeJobs = new ArrayList<ActiveJob>();
	}
		
	/* ========================================================================
	 * 	Send messages below
	 * ===================================================================== */
	/**
	 * confirmation message to the scheduler that it received the job correctly
	 */
	private void sendJobConfirmationToScheduler(Socket scheduler, int value) {
		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.CONFIRMATION, value, socket);
		scheduler.sendMessage(message);
	}
	
	/**
	 * Request to a worker for it to start executing some code
	 */
	private void sendJobRequestToWorker(Socket worker, Job job) {
		Message message = new Message(Message.SENDER.RESOURCE_MANAGER, Message.TYPE.REQUEST, job.getId(), socket);
		worker.sendMessage(message);
	}
	
	/**
	 * Confirmation to a worker that it received its result correctly
	 */
	private void sendJobResultConfirmationToWorker(Socket worker, int value) {
		
	}
	
	
	/* ========================================================================
	 * 	Receive messages below
	 * ===================================================================== */
	/**
	 * whenever the RM receives a jobrequest:
	 * 	- adds the job to the activeJobs list
	 *  - it confirms the request to the scheduler
	 *  - it sends the task to one of its available workers.
	 */	
	private void jobRequestHandler(Message message) {
		activeJobs.add(new ActiveJob(message.getJob(), message.senderSocket, null));
		sendJobConfirmationToScheduler(message.senderSocket, message.getValue());
		Socket availableWorker = getAvailableWorker();
		
		if (availableWorker == null) {
			// add to queue
			return;
		}
		
		sendJobRequestToWorker(availableWorker, message.getJob());
	}
	
	/**
	 * When the job gets confirmed by the worker (meaning that he is going to work on it)
	 *  - update the jobstatus to RUNNING
	 */
	private void jobConfirmationHandler(Message message) {
		// TODO
	}
	
	/**
	 * When we receive a jobresult from a worker node
	 *  - confirm jobresult received.
	 *  - check if there was an activejob with this data
	 *  		. pass the result to the scheduler
	 */
	public void jobResultHandler(Message message){
		// TODO
	}
	
	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a worker saying that he is available
	 * - Message from a worker saying that he received the Job and is going to start working on it. 
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
				// do w/e is nessesarry
				return;
			}
		}

		if (message.getSender() == Message.SENDER.SCHEDULER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				jobRequestHandler(message);
				return;
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				// do w/e is nessesarry
				return;
			}
		}
		
		// exception
	}
	
	
	
	/* ========================================================================
	 * 	Class functions
	 * ===================================================================== */
	/**
	 * onMessageReceive handler (1)
	 * NOTE also adds the worker to the resourceManager if it was not already in there :-)
	 */
	private void workerStatusHandler(Message message) {
		Socket workerSocket = message.senderSocket; // we use the socket as identifier for the worker
		Worker.STATUS newStatus = Worker.STATUS.values()[message.getValue()]; // hacky way to convert int -> enum
		workers.put(workerSocket, newStatus);
		
		System.out.println(Arrays.toString(workers.values().toArray()));
	}
	
	public Socket getSocket() {
		return socket;
	}
	
	private Socket getAvailableWorker() {
		ArrayList<Socket> workerSockets = new ArrayList<Socket>();
		for (Entry<Socket, Worker.STATUS> entry : workers.entrySet()) {
			Worker.STATUS status = entry.getValue();
			if (status == Worker.STATUS.AVAILABLE) {
				return entry.getKey();
			}
		}
		
		return null;
	}
}
