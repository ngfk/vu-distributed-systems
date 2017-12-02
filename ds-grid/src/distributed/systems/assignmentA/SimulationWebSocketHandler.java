package distributed.systems.assignmentA;

import java.io.IOException;

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

import distributed.systems.assignmentA.types.GridMessageInit;
import distributed.systems.assignmentA.types.GridMessageToggle;
import distributed.systems.assignmentA.types.GridSetup;

@WebSocket
public class SimulationWebSocketHandler {
	private static Gson gson = new Gson();
	private static JsonParser jsonParser = new JsonParser();
	
	private Session session;
	private Simulation simulation;

	/**
	 * Called if a Websocket connection closes
	 * 
	 * @param statusCode statuscode
	 * @param reason close reason
	 */
	@OnWebSocketClose
	public void onClose(int statusCode, String reason) {
		System.out.println("WebSocket Closed: statusCode=" + statusCode + ", reason=" + reason);
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
		this.session = session;
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
				
				this.simulation = new Simulation(initMessage.sizes.schedulers, initMessage.sizes.clusters, initMessage.sizes.workers);
				GridSetup setup = this.simulation.getGridSetup();
				
				// TODO send grid setup to interface
				
				break;
			case "setup":
				System.out.println("setup message received");
				break;
			case "toggle":
				System.out.println("toggle message received");
				GridMessageToggle toggleMessage = gson.fromJson(message, GridMessageToggle.class);
				
				System.out.println("Toggling node id " + toggleMessage.nodeId + " of type " + toggleMessage.nodeType);
				break;
			default:
				break;
			}
		} catch(JsonSyntaxException e) {
			System.out.println("Incorrect JSON received.");
		}
	}
}
