import React, { ReactNode, useState } from 'react';
import io from 'socket.io-client';

import SocketContext from './context';
import { SERVER_URL } from '../constants';

interface SocketProviderProps {
	children: ReactNode;
}

function SocketProvider({ children }: SocketProviderProps) {
	const [socket, setSocket] = useState<Optional<SocketIOClient.Socket>>(
		undefined
	);

	function initializeSocket() {
		console.log('initialize');
		setSocket(
			io(SERVER_URL, {
				path: '/api/socket',
				transports: ['websocket'],
				reconnection: false,
			})
		);
	}

	return (
		<SocketContext.Provider value={{ socket, initializeSocket }}>
			{children}
		</SocketContext.Provider>
	);
}

export default SocketProvider;
