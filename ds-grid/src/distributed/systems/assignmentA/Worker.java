package distributed.systems.assignmentA;


/**
 * Worker/Node does all the actual computations and returns the result to its resource manager.
 * Workers periodically send stillAlive messages to the resourceManagers to check if they did not die.
 * 
 * OnDie: 
 * 	the stillAlive message will not arrive
 *  
 * OnResurrect:
 * 	If a worker comes back to live, it can simply continues sending the stillAlive message to the resouceManager
 */
public class Worker implements ISocketCommunicator {
	public static enum STATUS {
		AVAILABLE,
		BUSY,
		DEAD
	}
	
	private Socket rmSocket; // socket to access the resource manager that belongs to the worker
	private Socket socket;
	
	private int id; // relative to each resource manager
	
	Worker(int id, Socket rmSocket){
		this.id = id;
		this.rmSocket = rmSocket;
		
		socket = new Socket(this);
		rmSocket.sendMessage(onCreateMessage());
	}
	
	public Socket getSocket() {
		return socket;
	}
	
	public void onMessageReceived(Message message) {
		
	}
	
	private Message onCreateMessage() {
		Message message = new Message(Message.SENDER.WORKER, Message.TYPE.STATUS, 0, socket);
		return message;
	}
}
