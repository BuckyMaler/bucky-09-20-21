import classNames from 'classnames';
import OrderBookRow from './OrderBookRow';
import { OrderType } from '../constants';
import { Order } from '../orderBookSlice';
import styles from './OrderBookTable.module.css';

type Props = {
  orders: Array<Order>;
  bidTotals: Array<number>;
  askTotals: Array<number>;
  orderType: OrderType;
};

function OrderBookTable(props: Props) {
  const { orders, bidTotals, askTotals, orderType } = props;
  const ordersSnapshot = orders.slice(0, 12);
  const isAsks = orderType === OrderType.Asks;
  const orderTotals = isAsks ? askTotals : bidTotals;
  const totalsMax = Math.max(
    bidTotals.slice(0, 12).pop() ?? 0,
    askTotals.slice(0, 12).pop() ?? 0
  );

  return (
    <div className={styles.orderBookTable}>
      <div
        className={classNames(styles.tableHead, { [styles.reverse]: isAsks })}
      >
        <div>Total</div>
        <div>Size</div>
        <div>Price</div>
      </div>
      <div className={styles.tableBody}>
        {ordersSnapshot.length ? (
          ordersSnapshot.map((order, i) => (
            <OrderBookRow
              key={`${orderType}-${order.price}`}
              order={order}
              orderTotal={orderTotals[i]}
              orderType={orderType}
              totalsMax={totalsMax}
            />
          ))
        ) : (
          <p className={styles.noData}>No data found</p>
        )}
      </div>
    </div>
  );
}

export default OrderBookTable;
