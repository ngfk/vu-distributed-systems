package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * The entry point of a cluster
 *
 * Requirements:
 * 	Needs to hold the active jobs in some sort of way -> ?
 *  Needs to know which Workers are available at all times -> through the hashmap
 *  Needs to know how to communicate with the workers -> through sockets
 */
public class ResourceManager implements ISocketCommunicator {
	private int id;
	
	private Socket socket;
	
	/**
	 * This is an hashmap of the worker nodes
	 *  The idea is that since we cannot access the worker just by referencing their object 
	 *  (would be weird IMO since they possibly are at another physical location)
	 *  We store the socket (which we use to communicate with the workers) and the status of that worker node
	 *   The resourceManager now knows at all times how to communicate with the workers, and what their status is.   
	 */
	private HashMap<Socket, Worker.STATUS> workers=new HashMap<Socket,Worker.STATUS>();
	
	
	ResourceManager(int id, int numberOfWorkers){
		this.id = id;
		socket = new Socket(this);
	}
		
	/**
	 * onMessageReceive handler (1)
	 * NOTE also adds the worker to the resourceManager if it was not already in there :-)
	 */
	private void updateWorkerStatus(Message message) {
		assert (message.getType() == Message.TYPE.STATUS);
		assert (message.getSender() == Message.SENDER.WORKER);
		
		Socket workerSocket = message.socket; // we use the socket as identifier for the worker
		Worker.STATUS newStatus = Worker.STATUS.values()[message.getValue()]; // hacky way to convert int -> enum
		workers.put(workerSocket, newStatus);
	}
	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a worker saying that he is available (status message)
	 * - Message from a worker saying that he received the Job and is going to start working on it. (confirmation message) 
	 * - Message from a scheduler saying that he has a Job for the cluster (request message)
	 * - Message from a scheduler saying that he received the result of the Job correctly (confirmation message)
	 */
	public void onMessageReceived(Message message) {
		System.out.println("I received a message bruff");
		
		if (message.getSender() == Message.SENDER.WORKER) {
			if (message.getType() == Message.TYPE.STATUS) {
				updateWorkerStatus(message);
				return;
			}
			
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				// do w/e is nessesarry
				return;
			}
		}

		if (message.getSender() == Message.SENDER.SCHEDULER) {
			if (message.getType() == Message.TYPE.REQUEST) {
				// do w/e is nessesarry
				return;
			}
			if (message.getType() == Message.TYPE.CONFIRMATION) {
				// do w/e is nessesarry
				return;
			}
		}
		
		// exception
		
	}
	
	public Socket getSocket() {
		return socket;
	}
}
