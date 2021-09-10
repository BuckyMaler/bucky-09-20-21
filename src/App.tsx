import { useEffect } from 'react';
import { usePageVisibility } from 'react-page-visibility';
import { useAppDispatch, useAppSelector, useTimeout } from './app/hooks';
import DisconnectedStatus from './features/disconnected-status/DisconnectedStatus';
import OrderBook from './features/order-book/containers/OrderBook';
import { WebsocketStatus } from './features/websocket/constants';
import {
  connectWebsocket,
  disconnectWebsocket,
  selectWebsocketStatus,
} from './features/websocket/websocketSlice';

function App() {
  const websocketStatus = useAppSelector(selectWebsocketStatus);
  const dispatch = useAppDispatch();
  const isPageVisible = usePageVisibility();

  useEffect(() => {
    dispatch(connectWebsocket());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useTimeout(
    () => {
      dispatch(disconnectWebsocket());
    },
    !isPageVisible && websocketStatus === WebsocketStatus.Connected
      ? 30000
      : null
  );

  return (
    <>
      {websocketStatus === WebsocketStatus.Disconnected && (
        <DisconnectedStatus
          handleReconnect={() => dispatch(connectWebsocket())}
        />
      )}
      <div style={{ padding: '14px' }}>
        <OrderBook />
      </div>
    </>
  );
}

export default App;
