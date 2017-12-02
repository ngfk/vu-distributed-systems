package distributed.systems.assignmentA.types;

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
