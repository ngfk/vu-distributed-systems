package distributed.systems.grid.model;

import java.util.ArrayList;

/**
 * The messages that travel over the sockets
 *   TODO I think that for every request message that is send, we should have a timer checking whether the confirmation message is received (on time ? )
 *   
 *  The meaning of the messages can be found below:
 *	SENDER	| TYPE			| VALUE	| MEANING
 *	- - - --- --- --- - - -
 *	user		| request		| 0		| the user is requesting the list of schedulers from a scheduler
 *	user		| confirmation	| 0		| the user is confirms that it received the scheduler list
 *	user		| request		| x > 1	| the user is requesting computation of job with jobId x
 *	user		| confirmation	| x > 1	| the user is confirms that it received reply belonging to job with jobId x
 *	- - - --- --- --- - - -
 * scheduler	| request		| x	> 1	| the scheduler requests confirmation from all other schedulers that is going to work on jobId: x
 * scheduler	| confirmation	| x	> 1	| the scheduler gets notified by another scheduler that it has acknowledged that he is going to do jobId: x
 * scheduler	| result			| x > 1	| the scheduler sends a message to another scheduler saying that it has received the result of jobId: x
 * scheduler	|acknowledgement| x > 1	| the scheduler sends a confirmation to another scheduler saying that it noted that he had received the results of jobId: x
 * scheduler	| request		| x > 1	| the scheduler sends a message to the resourceManager, asking it to execute this job.
 * 	- - - --- --- --- - - -
 * resourceM	| confirmation	| x > 1	| the rm confirms to the scheduler that it has received jobId: x
 * resourceM	| request		| x > 1	| the rm requests to a worker to compute job with jobId: x
 * resourceM	| confirmation	| x > 1	| the rm confirms to the worker that it has received the results of jobId: x
 * resourceM	| status			| 0		| the rm requests the worker to confirm he's alive
 * 	- - - --- --- --- - - -
 *	worker	| confirmation	| x > 1	| the worker confirms the request to the RM of jobId: x
 *	worker	| result			| x > 1	| the worker returns result of the job to the resourceManager
 *	worker	| status			| x		| this worker is updating its status to the ResourceManager (also used to register a worker with the resourceManager)
 */
public class Message {
	public static enum SENDER {
		WORKER, RESOURCE_MANAGER, SCHEDULER, USER
	}

	public static enum TYPE {
		STATUS, REQUEST, CONFIRMATION, RESULT, ACKNOWLEDGEMENT, TOGGLE
	}

	public Socket senderSocket; // socket that the receiver can use, to reply to the sender. 
	private Job job; // jobs can be send over sockets
	private ArrayList<Socket> sockets; // socket lists can be send in a message 

	private SENDER sender; // ubink
	private TYPE type;

	private int value; // this is what is actually happening

	Message(SENDER sender, TYPE type, int value, Socket senderSocket) {
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
