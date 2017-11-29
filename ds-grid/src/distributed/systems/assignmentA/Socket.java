package distributed.systems.assignmentA;


/**
 * Not an actual socket.. 
 * Just simulates the behavior of a real socket.
 */
public class Socket {
	private ISocketCommunicator node;
	
	Socket(ISocketCommunicator node){
		this.node = node;
	}
	
	/**
	 * If we send a message using this socket, ensure that it ends up at the right receiver
	 * 
	 * TODO
	 *  We could implement some delaying function here.. to simulate traffic on a network
	 */
	public void sendMessage(Message message) {
		message.socket = this;
		node.onMessageReceived(message);
	}
}
