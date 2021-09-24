import WS from 'jest-websocket-mock';
import OrderBook from './OrderBook';
import { Markets } from '../constants';
import { Feed, FeedEvent } from '../../websocket/constants';
import { connectWebsocket } from '../../websocket/websocketSlice';
import { store } from '../../../app/store';
import { fireEvent, render, screen, within } from '../../../test-utils';

let ws: WS;

beforeEach(async () => {
  ws = new WS('ws://localhost:3001', { jsonProtocol: true });
  store.dispatch(connectWebsocket());
  await ws.connected;
});

afterEach(() => {
  WS.clean();
});

describe('OrderBook', () => {
  test('should load data and switch markets', async () => {
    render(<OrderBook />);

    const orderBook = screen.getByTestId('order-book');

    expect(orderBook).toHaveTextContent(Markets[0].displayName);
    expect(within(orderBook).getByTestId('spinner')).toBeInTheDocument();
    await expect(ws).toReceiveMessage({
      event: FeedEvent.Subscribe,
      feed: Feed.Book,
      product_ids: [Markets[0].productId],
    });

    ws.send({
      event: FeedEvent.Subscribed,
      feed: Feed.Book,
      product_ids: [Markets[0].productId],
    });
    ws.send({
      numLevels: 3,
      feed: `${Feed.Book}_snapshot`,
      bids: [
        [43557.0, 110.0],
        [43555.0, 293.0],
        [43554.0, 1000.0],
      ],
      asks: [
        [43564.5, 6853.0],
        [43567.0, 1480.0],
        [43571.0, 3406.0],
      ],
      product_ids: [Markets[0].productId],
    });

    let [bidsTable, asksTable] = getOrderTables();
    let bidRows = getOrderRows(bidsTable);
    let askRows = getOrderRows(asksTable);

    expect(within(orderBook).queryByTestId('spinner')).not.toBeInTheDocument();
    expect(
      within(orderBook).getByText(/Spread: 7.5 \(0.02%\)/i)
    ).toBeInTheDocument();
    expect(bidRows).toHaveLength(3);
    expect(askRows).toHaveLength(3);
    assertOrders(
      [
        ['43,557.00', '110', '110'],
        ['43,555.00', '293', '403'],
        ['43,554.00', '1,000', '1,403'],
      ],
      bidRows
    );
    assertOrders(
      [
        ['43,564.50', '6,853', '6,853'],
        ['43,567.00', '1,480', '8,333'],
        ['43,571.00', '3,406', '11,739'],
      ],
      askRows
    );

    ws.send({
      feed: Feed.Book,
      bids: [
        [43538.5, 15000.0], // New price level
        [43555.0, 500.0], // Updated price level
        [43557.0, 0.0], // Price level to remove
      ],
      asks: [],
      product_ids: [Markets[0].productId],
    });

    bidRows = getOrderRows(bidsTable);
    askRows = getOrderRows(asksTable);

    expect(
      within(orderBook).getByText(/Spread: 9.5 \(0.02%\)/i)
    ).toBeInTheDocument();
    expect(bidRows).toHaveLength(3);
    expect(askRows).toHaveLength(3);
    assertOrders(
      [
        ['43,555.00', '500', '500'],
        ['43,554.00', '1,000', '1,500'],
        ['43,538.50', '15,000', '16,500'],
      ],
      bidRows
    );

    fireEvent.click(within(orderBook).getByText(/Toggle Feed/i));

    expect(orderBook).toHaveTextContent(Markets[1].displayName);
    expect(within(orderBook).getByTestId('spinner')).toBeInTheDocument();
    await expect(ws).toReceiveMessage({
      event: FeedEvent.Unsubscribe,
      feed: Feed.Book,
      product_ids: [Markets[0].productId],
    });

    ws.send({
      event: FeedEvent.Unsubscribed,
      feed: Feed.Book,
      product_ids: [Markets[0].productId],
    });

    await expect(ws).toReceiveMessage({
      event: FeedEvent.Subscribe,
      feed: Feed.Book,
      product_ids: [Markets[1].productId],
    });

    ws.send({
      event: FeedEvent.Subscribed,
      feed: Feed.Book,
      product_ids: [Markets[1].productId],
    });
    ws.send({
      numLevels: 3,
      feed: `${Feed.Book}_snapshot`,
      bids: [
        [3140.45, 2.0],
        [3140.4, 2759.0],
        [3140.15, 8904.0],
      ],
      asks: [
        [3141.2, 970.0],
        [3141.4, 10.0],
        [3141.45, 10002.0],
      ],
      product_ids: [Markets[1].productId],
    });

    [bidsTable, asksTable] = getOrderTables();
    bidRows = getOrderRows(bidsTable);
    askRows = getOrderRows(asksTable);

    expect(within(orderBook).queryByTestId('spinner')).not.toBeInTheDocument();
    expect(
      within(orderBook).getByText(/Spread: 0.8 \(0.02%\)/i)
    ).toBeInTheDocument();
    expect(bidRows).toHaveLength(3);
    expect(askRows).toHaveLength(3);
    assertOrders(
      [
        ['3,140.45', '2', '2'],
        ['3,140.40', '2,759', '2,761'],
        ['3,140.15', '8,904', '11,665'],
      ],
      bidRows
    );
    assertOrders(
      [
        ['3,141.20', '970', '970'],
        ['3,141.40', '10', '980'],
        ['3,141.45', '10,002', '10,982'],
      ],
      askRows
    );
  });

  test('should handle no data', async () => {
    render(<OrderBook />);

    const orderBook = screen.getByTestId('order-book');

    await expect(ws).toReceiveMessage({
      event: FeedEvent.Subscribe,
      feed: Feed.Book,
      product_ids: [Markets[0].productId],
    });

    ws.send({
      event: FeedEvent.Subscribed,
      feed: Feed.Book,
      product_ids: [Markets[0].productId],
    });
    ws.send({
      numLevels: 3,
      feed: `${Feed.Book}_snapshot`,
      bids: [],
      asks: [],
      product_ids: [Markets[0].productId],
    });

    const [bidsTable, asksTable] = getOrderTables();
    const bidRows = within(bidsTable).queryAllByTestId('order-book-row');
    const askRows = within(asksTable).queryAllByTestId('order-book-row');

    expect(within(orderBook).getByText(/Spread: -/i)).toBeInTheDocument();
    expect(bidRows).toHaveLength(0);
    expect(askRows).toHaveLength(0);
    expect(within(bidsTable).getByText(/No data found/i));
    expect(within(asksTable).getByText(/No data found/i));
  });
});

const getOrderTables = () => screen.getAllByTestId('order-book-table');

const getOrderRows = (orderTable: HTMLElement) =>
  within(orderTable).getAllByTestId('order-book-row');

function assertOrders(
  expectedOrders: Array<Array<string>>,
  actualOrders: Array<HTMLElement>
) {
  expectedOrders.forEach((order, i) => {
    order.forEach((value) => {
      expect(actualOrders[i]).toHaveTextContent(value);
    });
  });
}
