import type { ReactNode } from 'react';
import React, { useState } from 'react';
import io from 'socket.io-client';

import SocketContext from './context';
import { SERVER_URL } from '../constants';

interface SocketProviderProps {
	children: ReactNode;
}

function SocketProvider({ children }: SocketProviderProps) {
	const [socket, setSocket] = useState<Nullable<SocketIOClient.Socket>>(null);

	function initializeSocket() {
		console.log('initialize');
		const newSocket = io(SERVER_URL, {
			path: '/api/socket',
			transports: ['websocket'],
			reconnection: false,
		});
		setSocket(newSocket);
		console.log('new socket', newSocket);
	}

	return (
		<SocketContext.Provider value={{ socket, initializeSocket }}>
			{children}
		</SocketContext.Provider>
	);
}

export default SocketProvider;
