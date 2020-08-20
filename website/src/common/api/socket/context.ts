import React, { useContext } from 'react';

interface SocketContextValue {
	socket: Optional<SocketIOClient.Socket>;
	initializeSocket: () => void;
}

const SocketContext = React.createContext<SocketContextValue>({
	socket: undefined,
	initializeSocket: () => {},
});

function useSocket() {
	return useContext(SocketContext);
}

export default SocketContext;
export { useSocket };
