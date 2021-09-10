import styles from './DisconnectedStatus.module.css';

type Props = {
  handleReconnect: () => void;
};

function DisconnectedStatus(props: Props) {
  return (
    <div className={styles.disconnectedStatus}>
      The service is disconnected.
      <button className={styles.reconnect} onClick={props.handleReconnect}>
        Reconnect
      </button>
    </div>
  );
}

export default DisconnectedStatus;
