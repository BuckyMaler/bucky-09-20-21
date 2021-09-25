import { useEffect } from 'react';
import { usePageVisibility } from 'react-page-visibility';
import { useAppDispatch, useAppSelector, useTimeout } from './app/hooks';
import Spinner from './common/components/Spinner';
import OrderBook from './features/order-book/containers/OrderBook';
import { WebsocketStatus } from './features/websocket/constants';
import {
  connectWebsocket,
  disconnectWebsocket,
  selectWebsocketStatus,
} from './features/websocket/websocketSlice';
import styles from './App.module.css';

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

  const isLoading =
    !websocketStatus || websocketStatus === WebsocketStatus.Connecting;
  const isDisconnected = websocketStatus === WebsocketStatus.Disconnected;

  if (isLoading || isDisconnected) {
    return (
      <div className={styles.noData}>
        {isLoading ? (
          <Spinner />
        ) : (
          <p className={styles.disconnected}>
            The service is disconnected.{' '}
            <button
              className={styles.reconnect}
              onClick={() => dispatch(connectWebsocket())}
            >
              Reconnect
            </button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <OrderBook />
    </div>
  );
}

export default App;
