package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * The entry point of a cluster
 *
 * Requirements:
 * 	Needs to hold the active jobs in some sort of way
 *  Needs to know which Workers are available at all times
 */
public class ResourceManager implements ISocketCommunicator {
	private int id;
	
	/**
	 * This is an hashmap of the worker nodes
	 *  The idea is that since we cannot access the worker just by referencing their object 
	 *  (would be weird IMO since they possibly are at another physical location)
	 *  We store the socket (which we use to communicate with the workers) and the status of that worker node
	 *   The resourceManager now knows at all times how to communicate with the workers, and what their status is.   
	 */
	private HashMap<Socket, Integer> workers=new HashMap<Socket,Integer>();
	
	
	ResourceManager(int id, int numberOfWorkers){
		this.id = id;
	}
	
	/**
	 * The recourseManager only has a list of the communication channels to the actual workers
	 */
	public void addWorker(Socket workerSocket) {
		workers.put(workerSocket, Worker.AVAILABLE);
	}
	
	/**
	 * onMessageReceive handler (1)
	 * Not the most efficient way, but it will work
	 */
	private void updateWorkerStatus(Message message) {
		assert (message.type == Message.STATUS_MESSAGE);
		assert (message.sender == Message.WORKER);
		
		Socket workerSocket = message.socket; // we use this as identifier for the worker
		workers.put(workerSocket, message.status);
	}
	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a worker saying that he is available (status message)
	 * - Message from a worker saying that he received the Job and is going to start working on it. (confirmation message) 
	 * - Message from a cluster saying that he has a Job for the cluster (request message)
	 * - Message from a cluster saying that he received the result of the Job correctly (confirmation message)
	 */
	public void onMessageReceived(Message message) {
		System.out.println("I received a message bruff");
	}
}
