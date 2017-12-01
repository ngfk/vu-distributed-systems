package distributed.systems.assignmentA;

import java.util.ArrayList;
import java.util.HashMap;

/**
 * A scheduler know where to find all resource managers, other schedulers, and users?
 * 
 * The list of other schedulers is hard-coded
 * The list of resourceManagers is flexible
 * The list of users is flexible
 */
public class Scheduler implements ISocketCommunicator{
	public static enum STATUS {
		RUNNING,
		DEAD
	}
	private int id;
	private Socket socket;
	private ArrayList <ActiveJob> activeJobs; /* this is a shared datastructure between schedulers */
	
	private HashMap<Socket, Scheduler.STATUS> schedulers;
	
	
	Scheduler(int id){
		this.id = id;
		socket = new Socket(this);
	}
	
	public void addJob(Job job) {
		// TODO check if job is not in activeJobs
		// TODO notify other Schedulers of activeJob
		assert (!hasActiveJob(job)); // should maybe send an error to the user		
	}
	
	/* a scheduler should know about all other schedulers */
	public void setSchedulers(ArrayList<Socket> schedulerSockets) {
		schedulers = new HashMap<Socket,Scheduler.STATUS>();
		schedulers.put(socket, STATUS.RUNNING);
	}
	
	public ArrayList<Socket> getSchedulers(){
		ArrayList<Socket> list = new ArrayList<Socket>();
		list.addAll(schedulers.keySet());
		list.add(socket); // add self
		return list;
	}
	
	public Socket getSocket() {
		return socket;
	}

	/**
	 * Types of messages we expect here:
	 * 
	 * - Message from a scheduler, saying that it is accepting a new job
	 * - Message from a scheduler, saying that it has confirmed that this scheduler is going to start executing the job
	 * - ...
	 */
	public void onMessageReceived(Message message) {
		// TODO
		if (message.getSender() == Message.SENDER.SCHEDULER) {
			
		}
	}
	
	
	public void schedulerJobConfirmationHandler() {
		// WAIT FOR CONFIRMATIONS
		// SEND CONFIRMATION TO USER
		
		
	}
	
	public ActiveJob getActiveJob(Job job) {
		for (int i = 0; i < activeJobs.size(); i++) {
			if (activeJobs.get(i).job == job) {
				return activeJobs.get(i);
			}
		}
		return null;
	}
	
	public boolean hasActiveJob(Job job) {
		if (getActiveJob(job) == null) {
			return false;
		}
		return true;
	}
}
