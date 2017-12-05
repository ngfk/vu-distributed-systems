package distributed.systems.grid.gui;

import java.io.IOException;
import java.util.concurrent.Semaphore;

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
	private static Semaphore semaphore = new Semaphore(1);
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
			case "start":
				GuiMessageStart startMessage = gson.fromJson(message, GuiMessageStart.class);
				GuiMessageStartSizes sizes = startMessage.sizes;
				this.context = new SimulationContext().register(this);
				new Simulation(this.context, sizes.schedulers, sizes.clusters, sizes.workers);
				this.context.startSimulation();
				break;
			case "stop":
				if(context != null)
					this.context.stopSimulation();
				break;
			case "toggle":
				GuiMessageToggle toggleMessage = gson.fromJson(message, GuiMessageToggle.class);
				this.context.toggleNode(toggleMessage.nodeId, toggleMessage.nodeType);
				break;
			default:
				break;
			}
		} catch (JsonSyntaxException e) {
			System.out.println("Incorrect JSON received.");
		}
	}

	public void sendSetup(GridSetup setup) {
		GuiMessageSetup guiMessageSetup = new GuiMessageSetup(setup);
		this.send(gson.toJson(guiMessageSetup));
	}

	public void sendState(String nodeId, NodeType nodeType, NodeState nodeState) {
		GuiMessageState guiMessageState = new GuiMessageState(nodeId, nodeType, nodeState);
		this.send(gson.toJson(guiMessageState));
	}

	public void sendQueue(String nodeId, NodeType nodeType, int jobCount) {
		GuiMessageQueue guiMessageQueue = new GuiMessageQueue(nodeId, nodeType, jobCount);
		this.send(gson.toJson(guiMessageQueue));
	}
	
	private void send(String message) {
		try {
			semaphore.acquire();
			System.out.println(message);
			session.getRemote().sendString(message);
		} catch (InterruptedException e1) {
			System.out.println("Semaphore acquire interrupted?");
			e1.printStackTrace();
		} catch (IOException e) {
			System.out.println("Error sending websocket packet.");
		}
		
		semaphore.release();
	}
}
