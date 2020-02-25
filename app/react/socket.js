import io from 'socket.io-client';
import { isClient } from 'app/utils';

let socket = { on: () => {} };
if (isClient) {
  socket = io();
}

export default socket;

const reconnectSocket = () => {
  socket.disconnect();
  socket.connect();
};

export { reconnectSocket };
