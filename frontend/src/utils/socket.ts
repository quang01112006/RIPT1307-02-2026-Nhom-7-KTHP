import { io } from 'socket.io-client';

declare const APP_CONFIG_BACKEND_URL: string;
const url = typeof APP_CONFIG_BACKEND_URL !== 'undefined' && APP_CONFIG_BACKEND_URL 
  ? APP_CONFIG_BACKEND_URL 
  : 'http://localhost:3000';

const socket = io(url, {
	transports: ['websocket'],
	reconnectionAttempts: 30,
	reconnectionDelay: 3000,
	reconnection: true,
	auth: (cb) => {
		const token = localStorage.getItem('token');
		cb({ token });
	},
});

socket.connect();

// DEBUG
socket.on('connect', () => {
	console.log('Socket connected ' + socket.id);
});
socket.io.on('error', (err) => {
	console.error('Socket error:', err);
});
socket.io.on('reconnect', (attempt) => {
	console.log('Socket reconnect:', attempt);
});
socket.io.on('close', (reason) => {
	console.log('Socket closed, reason:', reason);
});

export default socket;
