import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer, Slide } from 'react-toastify';
import { useDispatch } from 'react-redux';

import Player, { PlayerStore } from 'src/common/api/player';
import { useSocket } from 'src/common/api/socket';
import { useRootSelector } from 'src/store';

import { TAB_PAGES, Tab } from './pages';
import Menu from './menu';
import GameInvitePopup from './GameInvitePopup';
import GameRoom from './pages/new-game/GameRoom';

function Home() {
	const [selectedTab, setSelectedTab] = useState({
		name: Tab.FRIENDS,
		props: {},
	});
	const { socket } = useSocket();
	const dispatch = useDispatch();
	const gameInvitePopup = useRef<React.ReactText | null>(null);
	const playerFriends = useRootSelector<Player[]>(
		PlayerStore.selectPlayerFriends
	);

	// listen to friends connection/disconnection event
	useEffect(() => {
		const cleanupFns: (() => void)[] = [];

		if (socket) {
			for (const friend of playerFriends) {
				const connectionEvent = `${friend.id}_connected`;
				const disconnectionEvent = `${friend.id}_disconnected`;

				socket
					.on(connectionEvent, () => {
						dispatch(
							PlayerStore.actions.changePlayerOnlineStatus({
								playerID: friend.id,
								isOnline: true,
							})
						);
					})
					.on(disconnectionEvent, () => {
						dispatch(
							PlayerStore.actions.changePlayerOnlineStatus({
								playerID: friend.id,
								isOnline: false,
							})
						);
					});

				cleanupFns.push(() => {
					socket.off(connectionEvent).off(disconnectionEvent);
				});
			}
		}

		return () => {
			cleanupFns.forEach((clean) => clean());
		};
	}, [socket, playerFriends, dispatch]);

	// listen to game invites
	useEffect(() => {
		socket
			?.on('game_invite', (fromPlayerJSON: string, roomID: string) => {
				const fromPlayer: Player = JSON.parse(fromPlayerJSON);

				gameInvitePopup.current = toast(
					<GameInvitePopup
						fromPlayerName={fromPlayer.username}
						onAccept={() => {
							rejectInvitation();
							socket?.emit('invite_accepted', roomID);
						}}
						onReject={rejectInvitation}
					/>,
					{
						autoClose: 30000,
						closeButton: false,
					}
				);
			})
			?.on('game_joined', (roomJSON: string) => {
				console.log('game joined', roomJSON);
				setSelectedTab({
					name: Tab.NEW_GAME,
					props: { initialGame: new GameRoom(roomJSON) },
				});
			})
			?.on('kicked_from_game', () => {
				toast.warn('You were kicked from the game.');
				setSelectedTab({
					name: Tab.FRIENDS,
					props: {},
				});
			});

		return () => {
			socket?.off('game_invite')?.off('game_joined')?.off('kicked_from_game');
		};
	});

	function rejectInvitation() {
		toast.dismiss(gameInvitePopup.current!);
	}

	// render sidebar menu items
	function renderMenuItems() {
		return Object.keys(Tab).map((tab) => {
			const { label, icon } = TAB_PAGES[tab as keyof typeof Tab];
			return (
				<Menu.Item
					key={label}
					selected={selectedTab.name === tab}
					icon={icon}
					onClick={() =>
						setSelectedTab({
							name: Tab[tab as keyof typeof Tab],
							props: {},
						})
					}
				>
					{label}
				</Menu.Item>
			);
		});
	}

	// render the selected tab page
	function renderTabPage() {
		const ActiveTabPage = TAB_PAGES[selectedTab.name].page;
		return <ActiveTabPage {...selectedTab.props} />;
	}

	return (
		<div className="flex flex-row h-screen w-screen max-h-screen">
			<ToastContainer transition={Slide} closeOnClick={false} />
			<div className="flex flex-col self-stretch pl-16 pr-20 py-20 bg-gray-200 shadow-inner shadow-lg">
				<h3 className="text-3xl font-bold mb-16">OpenKub</h3>
				<Menu>{renderMenuItems()}</Menu>
			</div>
			<div className="flex flex-auto pt-20 justify-center">
				{renderTabPage()}
			</div>
		</div>
	);
}

export default Home;
