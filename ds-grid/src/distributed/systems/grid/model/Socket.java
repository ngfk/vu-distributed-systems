package distributed.systems.grid.model;

import java.util.Random;

/**
 * Not an actual socket.. 
 * Just simulates the behavior of a real socket.
 */
public class Socket {
	private ISocketCommunicator node;
	private int lastReply;

	Socket(ISocketCommunicator node) {
		this.node = node; // the node where the message is going through
	}

	public int getId() {
		return this.node.getId();
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

	public void asyncSend(Message message) {
		Random rand = new Random();
		int delay = rand.nextInt(50);

		try {
			Thread.sleep(delay);
		} catch (InterruptedException ex) {
			Thread.currentThread().interrupt();
		}

		System.out.printf("[Socket(%d) -- %s(%d)->%s(%d) %s: %s]\n", delay, message.getSender(),
				message.senderSocket.getId(), node.getType(), node.getId(), message.getType(), message.getValue());
		node.onMessageReceived(message);
	}

}