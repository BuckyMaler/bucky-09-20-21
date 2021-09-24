import classNames from 'classnames';
import numeral from 'numeral';
import { OrderType } from '../constants';
import { Order } from '../orderBookSlice';
import styles from './OrderBookRow.module.css';

type Props = {
  order: Order;
  orderTotal: number;
  orderType: OrderType;
  totalsMax: number;
};

function OrderBookRow(props: Props) {
  const { order, orderTotal, orderType, totalsMax } = props;

  return (
    <div
      className={classNames(styles.orderBookRow, {
        [styles.reverse]: orderType === OrderType.Asks,
      })}
      data-testid="order-book-row"
    >
      <div>{numeral(orderTotal).format('0,0')}</div>
      <div>{numeral(order.qty).format('0,0')}</div>
      <div className={styles[`${orderType}Price`]}>
        {numeral(order.price).format('0,0.00')}
      </div>
      <div
        className={classNames(styles.bar, styles[`${orderType}Bar`])}
        style={{ width: `${(orderTotal / totalsMax) * 100}%` }}
      ></div>
    </div>
  );
}

export default OrderBookRow;
