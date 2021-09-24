import styles from './Spinner.module.css';

function Spinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      className={styles.spinner}
      data-testid="spinner"
    >
      <path d="M25.25 6.46c-10.32 0-18.68 8.37-18.68 18.68h4.07c0-8.07 6.54-14.61 14.62-14.61V6.46z" />
    </svg>
  );
}

export default Spinner;
