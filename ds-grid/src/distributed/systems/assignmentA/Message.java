package distributed.systems.assignmentA;

import java.util.ArrayList;

/**
 * The messages that travel over the sockets
 * 
 *  The meaning of the messages can be found below:
 *	SENDER	| TYPE			| VALUE	| MEANING
 *	worker	| status			| x		| this worker is updating its status to the ResourceManager (also used to register a worker with the resourceManager)
 *	worker	| confirmation	| x		| this worker is confirming the retrieval of jobId: x
 *	worker	| result			| x		| this worker is returning the result of the Job it was completing 
 *  - - - --- --- --- - - -
 *	user		| request		| 0		| the user is requesting the list of schedulers from a scheduler
 *	user		| request		| x > 1	| the user is requesting computation of job with jobId x
 *	user		| confirmation	| 0		| the user is confirms that it received the scheduler list
 *	user		| confirmation	| x > 1	| the user is confirms that it received reply belonging to job with jobId x
 *	- - - --- --- --- - - -
 * scheduler	| status			| 1		| the scheduler notifies other schedulers that it has received a job (job is attached on message), so that they can update their local activeJobs array
 * scheduler	| status			| 2		| the scheduler notifies other schedulers that it has received a job (job is attached on message), so that they can update their local activeJobs array
 * scheduler	| confirmation	| x		| the scheduler gets notified by another scheduler that it has acknowledged that he is going to do jobId: x
 */
public class Message {
	public static enum SENDER {
		WORKER,
		MANAGER,
		SCHEDULER,
		USER
	}
	
	public static enum TYPE {
		STATUS,
		REQUEST,
		CONFIRMATION,
		RESULT
	}
	
	public Socket senderSocket; // socket that the receiver can use, to reply to the sender. 
	private Job job; // jobs can be send over sockets
	private ArrayList<Socket> sockets; // socket lists can be send in a message 
	
	private SENDER sender; // ubink
	private TYPE type;
	
	private int value; // this is what is actually happening
	
	Message(SENDER sender, TYPE type, int value, Socket senderSocket){
		this.sender = sender;
		
		this.type = type;
		this.value = value;
		
		this.senderSocket = senderSocket;
	}
	
	/* go-setter bellow (copies because we cannot send pointers over the network) */
	public void attachJob(Job job) {
		this.job = job.copy();
	}
	public void attachSockets(ArrayList<Socket> sockets) {
		this.sockets = new ArrayList<>(sockets); // copy
	}
	/* go-getters bellow */
	public String toString() {
		return sender.toString() + " " + type.toString() + " " + value;
	}
	
	public SENDER getSender() {
		return sender;
	}
	
	public TYPE getType() {
		return type;
	}
	
	public int getValue() {
		return value;
	}
	
	public Job getJob() {
		return job;
	}
}
