import { useEffect, useState } from 'react';
import { Markets, OrderType } from '../constants';
import {
  selectAllAsks,
  selectAllAskTotals,
  selectAllBids,
  selectAllBidTotals,
  selectSnapshotReceived,
  selectSpread,
} from '../orderBookSlice';
import OrderBookSpread from '../components/OrderBookSpread';
import OrderBookTable from '../components/OrderBookTable';
import { Feed, FeedEvent, WebsocketStatus } from '../../websocket/constants';
import {
  selectFeedEvent,
  selectWebsocketStatus,
  subscribeFeed,
  unsubscribeFeed,
} from '../../websocket/websocketSlice';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import Panel from '../../../common/components/Panel';
import Spinner from '../../../common/components/Spinner';
import styles from './OrderBook.module.css';

function OrderBook() {
  const [activeMarket, setActiveMarket] = useState(Markets[0]);
  const websocketStatus = useAppSelector(selectWebsocketStatus);
  const feedEvent = useAppSelector(selectFeedEvent(Feed.Book));
  const bids = useAppSelector(selectAllBids);
  const asks = useAppSelector(selectAllAsks);
  const bidTotals = useAppSelector(selectAllBidTotals);
  const askTotals = useAppSelector(selectAllAskTotals);
  const spread = useAppSelector(selectSpread);
  const snapshotReceived = useAppSelector(selectSnapshotReceived);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      websocketStatus === WebsocketStatus.Connected &&
      feedEvent === FeedEvent.Unsubscribed
    ) {
      dispatch(
        subscribeFeed({ feed: Feed.Book, productId: activeMarket.productId })
      );
    }
  }, [websocketStatus, feedEvent, activeMarket, dispatch]);

  function handleToggleFeed() {
    dispatch(
      unsubscribeFeed({ feed: Feed.Book, productId: activeMarket.productId })
    );
    setActiveMarket(
      // @ts-ignore: Type 'undefined' is not assignable to type
      // 'SetStateAction<{ productId: string; displayName: string; }>'.
      Markets.find((market) => market.productId !== activeMarket.productId)
    );
  }

  let content;
  const websocketDisconnected =
    websocketStatus === WebsocketStatus.Disconnected;
  const isLoading = feedEvent !== FeedEvent.Subscribed || !snapshotReceived;

  if (websocketDisconnected || isLoading) {
    content = (
      <div className={styles.noData}>
        {websocketDisconnected ? <p>Service disconnected</p> : <Spinner />}
      </div>
    );
  } else {
    content = (
      <>
        <OrderBookSpread spread={spread} />
        <div className={styles.sidesContainer}>
          <div className={styles.side}>
            <OrderBookTable
              orders={bids}
              bidTotals={bidTotals}
              askTotals={askTotals}
              orderType={OrderType.Bids}
            />
          </div>
          <div className={styles.side}>
            <OrderBookTable
              orders={asks}
              askTotals={askTotals}
              bidTotals={bidTotals}
              orderType={OrderType.Asks}
            />
          </div>
        </div>
        <div className={styles.toggleContainer}>
          <button className={styles.toggle} onClick={handleToggleFeed}>
            Toggle Feed
          </button>
        </div>
      </>
    );
  }

  return (
    <Panel title={`Order Book - ${activeMarket.displayName}`} maxWidth="800px">
      {content}
    </Panel>
  );
}

export default OrderBook;
