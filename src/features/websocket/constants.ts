export const enum WebsocketStatus {
  Connecting = 'connecting',
  Connected = 'connected',
  Disconnected = 'disconnected',
}

export const Feed = {
  Book: 'book_ui_1',
};

export const FeedAlias = {
  [Feed.Book]: 'orderBook',
};

export const enum FeedEvent {
  Subscribe = 'subscribe',
  Unsubscribe = 'unsubscribe',
  Subscribed = 'subscribed',
  Unsubscribed = 'unsubscribed',
}
