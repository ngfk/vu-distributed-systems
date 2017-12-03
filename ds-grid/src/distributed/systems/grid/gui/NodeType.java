package distributed.systems.grid.gui;

import com.google.gson.annotations.SerializedName;

public enum NodeType {
	@SerializedName("scheduler")
	SCHEDULER,
	@SerializedName("resource-manager")
	RESOURCE_MANAGER,
	@SerializedName("worker")
	WORKER
}
