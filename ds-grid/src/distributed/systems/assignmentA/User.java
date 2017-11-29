package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * The computer that is pushing jobs to our System
 */
public class User implements Runnable {
	public static enum STATUS {
			IDLE,
			RUNNING
	}
	
	private int id;
	private STATUS status;
	
	private ArrayList<Socket> schedulers;
	
	/**
	 * Every user should at least know about 2 schedulers
	 */
	User(int id, Socket initialScheduler, Socket initialScheduler2){
		this.id = id;
		
		schedulers = new ArrayList<Socket>();
		schedulers.add(initialScheduler);
		schedulers.add(initialScheduler2);
	}
	
	public void run() {
		while (true) {
			
			/* Add a new job to the system that take up random time */
			Job job = new Job(8000 + (int)(Math.random() * 5000));
			
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
	public void sendJob(Job job) {
		
	}
	
}
