package distributed.systems.assignmentA;


/**
 * The messages that travel over the sockets
 * 
 *	The meaning of the messages can be found below:
 *	SENDER    | TYPE         | VALUE     | MEANING
 *	worker 	  | status       |    1		| this worker is saying that it is available to the resourceManager
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
	
	public Socket socket; // NOTE: gets set automatically by socket class when a message is send over that socket
	
	private SENDER sender; // ubink
	private TYPE type;
	
	private int value; // this is what is actually happening
	
	Message(SENDER sender, TYPE type, int value){
		this.sender = sender;
		
		this.type = type;
		this.value = value;
	}
	
	
	/* go-getters bellow */
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
