import {
  createAction,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { put, takeEvery } from 'redux-saga/effects';
import { FeedAlias, FeedEvent, WebsocketStatus } from './constants';
import { RootState } from '../../app/store';

interface WebsocketState {
  status: WebsocketStatus | null;
  feeds: { [key: string]: FeedEvent };
}

const initialState: WebsocketState = {
  status: null,
  feeds: {},
};

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    websocketConnecting(state) {
      state.status = WebsocketStatus.Connecting;
    },
    websocketConnected(state) {
      state.status = WebsocketStatus.Connected;
    },
    websocketDisconnected(state) {
      state.status = WebsocketStatus.Disconnected;
      state.feeds = {};
    },
    subscribeFeed(
      state,
      action: PayloadAction<{ feed: string; productId: string }>
    ) {
      state.feeds[action.payload.feed] = FeedEvent.Subscribe;
    },
    unsubscribeFeed(
      state,
      action: PayloadAction<{ feed: string; productId: string }>
    ) {
      state.feeds[action.payload.feed] = FeedEvent.Unsubscribe;
    },
    feedSubscribed(state, action: PayloadAction<string>) {
      state.feeds[action.payload] = FeedEvent.Subscribed;
    },
    feedUnsubscribed(state, action: PayloadAction<string>) {
      state.feeds[action.payload] = FeedEvent.Unsubscribed;
    },
  },
});

export const {
  websocketConnecting,
  websocketConnected,
  websocketDisconnected,
  subscribeFeed,
  unsubscribeFeed,
  feedSubscribed,
  feedUnsubscribed,
} = websocketSlice.actions;

export const connectWebsocket = createAction('websocket/connectWebsocket');

export const disconnectWebsocket = createAction(
  'websocket/disconnectWebsocket'
);

export const websocketMessage = createAction<MessageEvent>(
  'websocket/websocketMessage'
);

export const websocketSend = createAction(
  'websocket/websocketSend',
  (message: { [key: string]: any }) => ({ payload: JSON.stringify(message) })
);

function* websocketMessageWorker(action: ReturnType<typeof websocketMessage>) {
  try {
    const data = JSON.parse(action.payload.data);

    if (data.hasOwnProperty('event')) {
      switch (data.event) {
        case FeedEvent.Subscribed:
          yield put(feedSubscribed(data.feed));
          break;
        case FeedEvent.Unsubscribed:
          yield put(feedUnsubscribed(data.feed));
          break;
      }
    } else if (data.hasOwnProperty('feed')) {
      const regex = /_snapshot$/;
      const isSnapshot = regex.test(data.feed);
      const shortFeed = data.feed.replace(regex, '');
      const typeDomain = FeedAlias[shortFeed];
      const typeDescription = `${isSnapshot ? 'snapshot' : 'delta'}Message`;
      yield put({ type: `${typeDomain}/${typeDescription}`, payload: data });
    }
  } catch (e) {}
}

function* subscribeFeedWorker(action: ReturnType<typeof subscribeFeed>) {
  yield put(
    websocketSend({
      event: FeedEvent.Subscribe,
      feed: action.payload.feed,
      product_ids: [action.payload.productId],
    })
  );
}

function* unsubscribeFeedWorker(action: ReturnType<typeof unsubscribeFeed>) {
  yield put(
    websocketSend({
      event: FeedEvent.Unsubscribe,
      feed: action.payload.feed,
      product_ids: [action.payload.productId],
    })
  );
}

export function* websocketSaga() {
  yield takeEvery(websocketMessage.type, websocketMessageWorker);
  yield takeEvery(subscribeFeed.type, subscribeFeedWorker);
  yield takeEvery(unsubscribeFeed.type, unsubscribeFeedWorker);
}

export const selectWebsocketStatus = (state: RootState) =>
  state.websocket.status;

export const selectFeedEvent = (feed: string) =>
  createSelector(
    (state: RootState) => state.websocket.feeds,
    (feeds) => feeds[feed] ?? FeedEvent.Unsubscribed
  );

export default websocketSlice.reducer;
