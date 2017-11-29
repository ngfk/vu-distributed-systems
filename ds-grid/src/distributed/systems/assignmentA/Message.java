package distributed.systems.assignmentA;


/**
 * The messages that travel over the sockets
 * 
 *	The meaning of the messages can be found below:
 *	SENDER    | TYPE         | VALUE     | MEANING
 *	worker 	  | status       |    x		| this worker is updating its status to the ResourceManager (also used to register a worker with the resourceManager)
 *  worker 	  | confirmation |    x	    | this worker is confirming the retrieval of Job with id <value>
 *  worker 	  | result       |    x   	| this worker is returning the result of the Job it was completing 
 *  - - - --- --- --- - - -
 *
 */
public class Message {
	public static enum SENDER {
		WORKER,
		MANAGER,
		SCHEDULER
	}
	
	public static enum TYPE {
		STATUS,
		REQUEST,
		CONFIRMATION,
		RESULT
	}
	
	public Socket senderSocket; // socket that the receiver can use, to reply to the sender. 
	private Job job; // a message can just contain an entire job object. cuz why not.
	
	private SENDER sender; // ubink
	private TYPE type;
	
	private int value; // this is what is actually happening
	
	Message(SENDER sender, TYPE type, int value, Socket senderSocket){
		this.sender = sender;
		
		this.type = type;
		this.value = value;
		
		this.senderSocket = senderSocket;
	}
	
	/* go-setter bellow */
	public void attachJob(Job job) {
		this.job = job.copy();
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
}
