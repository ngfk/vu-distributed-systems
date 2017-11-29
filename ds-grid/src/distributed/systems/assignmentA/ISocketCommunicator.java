package distributed.systems.assignmentA;

/**
 * Interface for every node that wants to receive messages through a socket
 * 
 *
 */
public interface ISocketCommunicator {
	
	public void onMessageReceived(Message message);

}
