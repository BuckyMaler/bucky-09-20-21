import numeral from 'numeral';
import styles from './OrderBookSpread.module.css';

type Props = {
  spread: {
    difference: number;
    percentage: number;
  } | null;
};

function OrderBookSpread(props: Props) {
  return (
    <div className={styles.orderBookSpread}>
      Spread:{' '}
      {props.spread ? (
        <>
          {numeral(props.spread.difference).format('0.0')} (
          {numeral(props.spread.percentage).format('0.00%')}){' '}
        </>
      ) : (
        '-'
      )}
    </div>
  );
}

export default OrderBookSpread;
