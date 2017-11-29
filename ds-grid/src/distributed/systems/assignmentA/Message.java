package distributed.systems.assignmentA;


/**
 * The messages that travel over the sockets
 *
 */
public class Message {
	/* message types */
	public static final int STATUS_MESSAGE = 0;
	public static final int REQUEST_MESSAGE = 1;
	public static final int CONFIRMATION_MESSAGE = 2;
	
	/* message senders */
	public static final int WORKER = 0;
	public static final int RESOURCE_MANAGER = 1;
	public static final int SCHEDULER = 2;
	
	public Socket socket; // the socket that this message uses.
	public int status;  // communicate only with status messages
	public int type; 
	public int sender;
}
