package distributed.systems.assignmentA;


/**
 * Not an actual socket.. 
 * Just simulates the behavior of a real socket.
 */
public class Socket {
	private ISocketCommunicator node;
	
	Socket(ISocketCommunicator node){
		this.node = node; // the node where the message is going through
	}
	
	public int getId() {
		return this.node.getId();
	}
	
	/**
	 * If we send a message using this socket, ensure that it ends up at the right receiver
	 * 
	 * TODO
	 *  We could implement some delaying function here.. to simulate traffic on a network
	 */
	public void sendMessage(Message message) {
		System.out.printf("[Socket -- %s(%d)->%s(%d) %s: %s]\n", message.getSender(), message.senderSocket.getId(), node.getType(), node.getId(), message.getType(), message.getValue());
		node.onMessageReceived(message);
	}
}
