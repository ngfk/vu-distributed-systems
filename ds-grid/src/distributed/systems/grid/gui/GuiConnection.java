package distributed.systems.grid.gui;

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

import distributed.systems.grid.simulation.GridSetup;
import distributed.systems.grid.simulation.Simulation;
import distributed.systems.grid.simulation.SimulationContext;

@WebSocket
public class GuiConnection {
	private static Gson gson = new Gson();
	private static JsonParser jsonParser = new JsonParser();

	private Session session;
	private SimulationContext context;

	/**
	 * Called if a WebSocket connection closes.
	 * @param statusCode The status code
	 * @param reason Close reason
	 */
	@OnWebSocketClose
	public void onClose(int statusCode, String reason) {
		System.out.println("WebSocket Closed: statusCode=" + statusCode + ", reason=" + reason);
	}

	/**
	 * Called if a WebSocket error occurs.
	 * @param t The error reason
	 */
	@OnWebSocketError
	public void onError(Throwable t) {
		System.out.println("WebSocket Error: " + t.getMessage());
	}

	/**
	 * Called if a new WebSocket connection is created.
	 * @param session The new session
	 */
	@OnWebSocketConnect
	public void onConnect(Session session) {
		// Add new session to ArrayList.
		this.session = session;
		System.out.println("WebSocket client connected: " + session.getRemoteAddress().getAddress());
	}

	/**
	 * Called if a new WebSocket packet is received.
	 * @param message The received data
	 */
	@OnWebSocketMessage
	public void onMessage(String message) {
		System.out.println("WebSocket Message received: " + message);

		try {
			JsonObject jsonObj = (JsonObject) jsonParser.parse(message);
			String messageType = jsonObj.get("type").toString().replaceAll("\"", "");

			switch (messageType) {
			case "init":
				GuiMessageInit initMessage = gson.fromJson(message, GuiMessageInit.class);
				GuiMessageInitSizes sizes = initMessage.sizes;

				this.context = new SimulationContext().register(this);
				new Simulation(this.context, sizes.schedulers, sizes.clusters, sizes.workers);
			break;
			case "setup":
				System.out.println("setup message received");
				break;
			case "toggle":
				System.out.println("toggle message received");
				GuiMessageToggle toggleMessage = gson.fromJson(message, GuiMessageToggle.class);

				System.out.println("Toggling node id " + toggleMessage.nodeId + " of type " + toggleMessage.nodeType);
				break;
			default:
				break;
			}
		} catch (JsonSyntaxException e) {
			System.out.println("Incorrect JSON received.");
		}
	}

	public void sendSetup(GridSetup setup) {
		GuiMessageSetup gridMessageSetup = new GuiMessageSetup(setup);
		System.out.println(gson.toJson(gridMessageSetup));
		this.send(gson.toJson(gridMessageSetup));
	}

	private void send(String message) {
		try {
			session.getRemote().sendString(message);
		} catch (IOException e) {
			System.out.println("Error sending websocket packet.");
		}
	}
}