package distributed.systems.grid.model;

import java.util.UUID;

import distributed.systems.grid.simulation.SimulationContext;

public abstract class GridNode implements ISocketCommunicator, Runnable {
    public static enum TYPE {
        USER, SCHEDULER, RESOURCE_MANAGER, WORKER
    }

    protected final String id;
    protected final int nr;
    protected final SimulationContext context;
    protected final TYPE type;
    protected final Socket socket;

    private boolean running;
    private Thread thread;

    protected GridNode(SimulationContext context, TYPE type) {
        this.id = UUID.randomUUID().toString();
        this.context = context.register(this);
        this.nr = this.context.getNr(this);
        this.type = type;
        this.socket = new Socket(this);

        this.running = false;
        this.thread = null;
    }

    public String getId() {
        return this.id;
    }

    public int getNr() {
        return this.nr;
    }

    public String getType() {
        return this.type.toString();
    }

    public Socket getSocket() {
        return this.socket;
    }

    public void sendQueue(int jobCount) {
        this.context.sendQueue(this.id, this.type, jobCount);
    }

	public void start() {
		if (this.thread != null) this.stop();
		this.running = true;
		this.thread = new Thread(this);
		this.thread.run();
	}
	
	public void stop() {
		if (this.thread == null) return;
		
		try {
			this.running = false;
			this.thread.join();
			this.thread = null;
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
    }
    
    public void run() {
        try {
            while (this.running) {
                this.runNode();
                Thread.sleep(200);
            }
        } catch (InterruptedException e) {
            assert (false) : "Simulation runtread was interrupted";
        }
    }

    public abstract void toggleState();
    public abstract void runNode() throws InterruptedException;
}
