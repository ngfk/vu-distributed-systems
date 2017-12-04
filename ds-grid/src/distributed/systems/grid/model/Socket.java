package distributed.systems.grid.model;

import java.util.Random;

/**
 * Not an actual socket.. 
 * Just simulates the behavior of a real socket.
 */
public class Socket {
	private ISocketCommunicator node;
	private long lastAlive;
	
	
	Socket(ISocketCommunicator node) {
		this.node = node; // the node where the message is going through
		isAlive();
	}
		
	/**
	 * We use this to check whenever we last got a response over this socket
	 *  & thus to determine whenever a node has died;
	 *  - This function updates the lastAlive timestamp of a node.
	 */
	public void isAlive() {
		this.lastAlive = System.currentTimeMillis();
	}
	
	/**
	 * flexible function to check if a node is dead
	 * @param delta - how long we should wait 
	 */
	public boolean lastAliveIn(long delta) {
		if (this.lastAlive < System.currentTimeMillis() - delta) {
			return false;
		}
		return true;
	}
	
	public void debugLastAliveIn(long delta) {
		System.out.printf("%d >= %d - %d\n", this.lastAlive, System.currentTimeMillis(), delta);
	}

	public String getId() {
		return this.node.getId();
	}
	
	public int getNr() {
		return this.node.getNr();
	}

	/**
	 * If we send a message using this socket, ensure that it ends up at the right receiver
	 */
	public void sendMessage(Message message) {

		new Thread(new Runnable() {
			public void run() {
				asyncSend(message);
			}
		}).start();
	}

	/**
	 * sends the messages in a non-blocking way with some delay (simulate traffic on a network)
	 */
	public void asyncSend(Message message) {
		Random rand = new Random();
		int delay = rand.nextInt(50);

		try {
			Thread.sleep(delay);
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
		}

		System.out.printf("[Socket(%d) -- %s(%d)->%s(%d) %s: %s]\n", delay, message.getSender(),
				message.senderSocket.getNr(), node.getType(), node.getNr(), message.getType(), message.getValue());
		node.onMessageReceived(message);
	}

}
