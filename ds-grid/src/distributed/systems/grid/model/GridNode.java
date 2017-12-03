package distributed.systems.grid.model;

import distributed.systems.grid.simulation.SimulationContext;
import java.util.UUID;

public abstract class GridNode implements ISocketCommunicator {
    public static enum TYPE {
        USER, SCHEDULER, RESOURCE_MANAGER, WORKER
    }

    protected final String id;
    protected final SimulationContext context;
    protected final TYPE type;
    protected final Socket socket;

    protected GridNode(SimulationContext context, TYPE type) {
        this.id = UUID.randomUUID().toString();
        this.context = context.register(this);
        this.type = type;
        this.socket = new Socket(this);
    }

    public String getId() {
        return this.id;
    }

    public int getNr() {
        return this.context.getNr(this);
    }

    public String getType() {
        return this.type.toString();
    }

    	public Socket getSocket() {
    		return this.socket;
    }
}
