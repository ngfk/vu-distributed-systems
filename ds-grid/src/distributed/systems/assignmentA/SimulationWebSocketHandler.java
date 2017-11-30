package distributed.systems.assignmentA;

import java.io.IOException;
import java.util.ArrayList;

import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketError;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.JsonSyntaxException;
import com.google.gson.stream.MalformedJsonException;

import distributed.systems.assignmentA.types.GridMessageInit;

@WebSocket
public class SimulationWebSocketHandler {
	/// Holds all connected WebSocket connections
	private static ArrayList<Session> sessions = new ArrayList<Session>();
	private static Gson gson = new Gson();
	private static JsonParser jsonParser = new JsonParser();

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
		
		try {
			JsonObject jsonObj = (JsonObject)jsonParser.parse(message);
			String messageType = jsonObj.get("type").toString().replaceAll("\"", "");
			
			switch(messageType) {
			case "init":
				GridMessageInit initMessage = gson.fromJson(message, GridMessageInit.class);
				
				// TODO create new Simulation object with the following cluster, scheduler, worker size? or at least change the sizes.
				System.out.println("clusters: " + initMessage.sizes.clusters);
				System.out.println("schedulers: " + initMessage.sizes.schedulers);
				System.out.println("workers: " + initMessage.sizes.workers);
				break;
			case "setup":
				System.out.println("setup message received");
				break;
			default:
				break;
			}
		} catch(JsonSyntaxException e) {
			System.out.println("Incorrect JSON received.");
		} 
		
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