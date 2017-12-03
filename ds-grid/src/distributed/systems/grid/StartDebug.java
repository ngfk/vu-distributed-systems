package distributed.systems.grid;

import distributed.systems.grid.simulation.Simulation;
import distributed.systems.grid.simulation.SimulationContext;

public class StartDebug {
	public static void main(String[] args) {
		SimulationContext context = new SimulationContext()
			.startAutomatically(1);
			
		new Simulation(context, 2, 2, 2); 
	}
}
