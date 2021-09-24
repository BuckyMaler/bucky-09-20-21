import { Middleware } from '@reduxjs/toolkit';
import {
  connectWebsocket,
  disconnectWebsocket,
  websocketConnected,
  websocketConnecting,
  websocketDisconnected,
  websocketMessage,
  websocketSend,
} from '../features/websocket/websocketSlice';

function websocketMiddleware(): Middleware {
  let websocket: WebSocket | null;

  return (storeAPI) => (next) => (action) => {
    switch (action.type) {
      case connectWebsocket.type:
        storeAPI.dispatch(websocketConnecting());
        websocket = new WebSocket(
          process.env.NODE_ENV !== 'test'
            ? 'wss://www.cryptofacilities.com/ws/v1'
            : 'ws://localhost:3001'
        );
        websocket.onopen = () => {
          storeAPI.dispatch(websocketConnected());
        };
        websocket.onclose = () => {
          storeAPI.dispatch(websocketDisconnected());
          websocket = null;
        };
        websocket.onmessage = (message: MessageEvent) => {
          storeAPI.dispatch(websocketMessage(message));
        };
        break;
      case websocketSend.type:
        if (websocket && websocket.readyState === 1) {
          websocket.send(action.payload);
        }
        break;
      case disconnectWebsocket.type:
        if (websocket) {
          websocket.close();
        }
        break;
    }

    return next(action);
  };
}

export default websocketMiddleware;
