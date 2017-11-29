package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * A scheduler know where to find all resource managers, other schedulers, and users?
 * 
 * Requirements
 * - All scheduler communication should go through sockets 
 *
 */
public class Scheduler implements ISocketCommunicator{
	private int id;
	private Socket socket;
	private ArrayList <Job> activeJobs;
	private ArrayList <Socket> otherSchedulers;
	
	
	Scheduler(int id){
		this.id = id;
		socket = new Socket(this);
	}
	
	public void addJob(Job job) {
		// TODO check if job is not in activeJobs
		// TODO notify other Schedulers of activeJob
		// WAIT FOR CONFIRMATIONS
		// SEND CONFIRMATION TO USER
		
	}
	
	/* a scheduler should know about all other schedulers */
	public void registerScheduler(Socket socket) {
		// it should not be able to register its own socket..
		assert(this.socket != socket);
		otherSchedulers.add(socket);
	}
	
	public ArrayList<Socket> getSchedulers(){
		return otherSchedulers;
	}
	
	public Socket getSocket() {
		return socket;
	}

	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a scheduler, saying that it is accepting a new job
	 * - ...
	 * - ...
	 */
	public void onMessageReceived(Message message) {
		// TODO
	}
}
