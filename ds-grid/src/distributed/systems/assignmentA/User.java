package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * The computer that is pushing jobs to our System
 */
public class User implements ISocketCommunicator, Runnable {
	public static enum STATUS {
			IDLE,
			RUNNING
	}
	
	private int id;
	private STATUS status;
	private Socket socket;
	
	
	private ArrayList<Socket> schedulers; // this should only store the active schedulers
	
	/**
	 * Every user should at least know about 2 schedulers
	 */
	User(int id, ArrayList<Socket> schedulers){
		this.id = id;
		socket = new Socket(this);
		
		this.schedulers = schedulers;
	}
	
	
	private void requestSchedulerList() {
		// TODO it should actually first verify wether the scheduler is up.. and maybe store somewhere the statusses of these schedulers.
		schedulers.get(0).sendMessage(getSchedulersMessage()); // the result will come in at the onMessageReceived function
	}
	
	/**
	 * request new scheduler list
	 *  asks to a scheduler a new list of schedulers
	 */
	private void updateSchedulers() {
		// TODO send request schedulers message to a scheduler.
	}
	
	

	/* loop that produces the jobs */
	public void run() {
		while (true) {
			/* Add a new job to the system that take up random time */
			Job job = new Job(8000 + (int)(Math.random() * 5000));
			doJob(job);
			
			try {
				Thread.sleep(100L);
			} catch (InterruptedException e) {
				assert(false) : "Simulation runtread was interrupted";
			}
			
		}
	}
	
	/**
	 * should send a new job to a scheduler
	 */
	public void doJob(Job job) {
		
	}
	
	
	private Message getSchedulersMessage() {
		return new Message(Message.SENDER.USER, Message.TYPE.REQUEST, 0, socket);
	}

	
	public void onMessageReceived(Message message) {
		// TODO 
		
	}
	
}
