import React, { useContext } from 'react';

interface SocketContextValue {
	socket: Nullable<SocketIOClient.Socket>;
	initializeSocket: () => void;
}

const SocketContext = React.createContext<SocketContextValue>({
	socket: null,
	initializeSocket: () => {},
});

function useSocket() {
	return useContext(SocketContext);
}

export default SocketContext;
export { useSocket };
