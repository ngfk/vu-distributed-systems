package distributed.systems.assignmentA;

import java.io.IOException;
import java.util.ArrayList;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketError;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

@WebSocket
public class SimulationWebSocketHandler {
	/// Holds all connected WebSocket connections
	private static ArrayList<Session> sessions = new ArrayList<Session>();

	/**
	 * Called if a Websocket connection closes
	 * 
	 * @param statusCode statuscode
	 * @param reason close reason
	 */
	@OnWebSocketClose
	public void onClose(int statusCode, String reason) {
		System.out.println("WebSocket Closed: statusCode=" + statusCode + ", reason=" + reason);

		// Remove all closed sessions.
		for (Session session : sessions) {
			if (!session.isOpen()) {
				sessions.remove(session);
			}
		}
	}

	/**
	 * Called if a Websocket error occurs
	 * 
	 * @param t the error reason
	 */
	@OnWebSocketError
	public void onError(Throwable t) {
		System.out.println("WebSocket Error: " + t.getMessage());
	}

	/**
	 * Called if a new Websocket connection is created
	 * 
	 * @param session the new session
	 */
	@OnWebSocketConnect
	public void onConnect(Session session) {
		// Add new session to ArrayList.
		sessions.add(session);
		System.out.println("WebSocket client connected: " + session.getRemoteAddress().getAddress());
	}

	/**
	 * Called if a new Websocket packet is received
	 * 
	 * @param message the received data
	 */
	@OnWebSocketMessage
	public void onMessage(String message) {
		System.out.println("WebSocket Message received: " + message);
	}

	/**
	 * Function to send a message to all open Websocket connections.
	 * 
	 * @param message the message to be sent
	 */
	public static void Broadcast(String message) {
		// Only broadcast the message to connected WebSockets.
		sessions.stream().filter(session -> session.isOpen()).forEach(session -> {
			try {
				session.getRemote().sendString(message);
			} catch (IOException e) {
				e.printStackTrace();
			}
		});
	}
}