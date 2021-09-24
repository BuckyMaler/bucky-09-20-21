import styles from './Panel.module.css';

type Props = {
  title: string;
  maxWidth: string;
  testId?: string;
};

function Panel(props: React.PropsWithChildren<Props>) {
  return (
    <div
      className={styles.panel}
      style={{ maxWidth: props.maxWidth }}
      data-testid={props.testId}
    >
      <h3 className={styles.title}>{props.title}</h3>
      {props.children}
    </div>
  );
}

export default Panel;
