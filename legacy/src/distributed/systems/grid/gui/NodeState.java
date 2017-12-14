package distributed.systems.grid.gui;

import com.google.gson.annotations.SerializedName;

public enum NodeState {
	@SerializedName("online")
	ONLINE,
	@SerializedName("offline")
	OFFLINE,
	@SerializedName("busy")
	BUSY,
	@SerializedName("unreachable")
	UNREACHABLE
}
