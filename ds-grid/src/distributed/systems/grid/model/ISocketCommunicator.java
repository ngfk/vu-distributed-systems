package distributed.systems.grid.model;

/**
 * Interface for every node that wants to receive messages through a socket.
 */
public interface ISocketCommunicator {
	public int getId();

	public String getType();

	public void onMessageReceived(Message message);
}
