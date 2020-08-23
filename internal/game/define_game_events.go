package game

import socketio "github.com/googollee/go-socket.io"

// DefineGameEvents defines socket.io events related to game
func DefineGameEvents(server *socketio.Server) {
	server.OnEvent("/", "create_game", createGame)
	server.OnEvent("/", "send_game_invite", sendGameInvite)
	server.OnEvent("/", "invite_accepted", addPlayerToGame)
	server.OnEvent("/", "kick_player", kickPlayer)
	server.OnEvent("/", "player_ready", playerReady)
	server.OnEvent("/", "player_unready", playerUnready)
	server.OnEvent("/", "start_game", startGame)
}
