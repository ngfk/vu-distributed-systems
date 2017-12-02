package distributed.systems.assignmentA;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.websocket.server.WebSocketHandler;
import org.eclipse.jetty.websocket.servlet.WebSocketServletFactory;

public class WebSocketServer implements Runnable {
	/// Websocket server port
	private static final int PORT = 4000;

	/**
	 * The WebsocketServer thread run method
	 */
	@Override
	public void run() {
		// Create WebSocket server.
		Server server = new Server(PORT);
		
		// Register WebSocket callback.
		WebSocketHandler wsHandler = new WebSocketHandler() {
			@Override
			public void configure(WebSocketServletFactory factory) {
				factory.register(SimulationWebSocketHandler.class);
			}
		};
		server.setHandler(wsHandler);
		
		// Start WebSocket server.
		try {
			server.start();
			server.join();
		} catch (Exception e) {
			System.out.println("ERROR: Can't start Websocket Server, is port " + PORT + " in use?");
		}
	}

	public static void main(String[] args) {
		/* Create the WebSocketServer thread */
		Thread serverThread = new Thread(new WebSocketServer());
		serverThread.start();
	}
}
