import styles from "./Header.module.css";

type HeaderProps = {
  username?: string;
};

export default function Header({ username = "Username" }: HeaderProps) {
  return (
    <header className ={styles.header}>
      
      {/* Logo */}
      <h1 className={styles.logo}>DORMDASH</h1>

      {/* User section */}
      <div className={styles.userSection}>
        <span className={styles.greeting}>
          HI, {username}
        </span>

        <div className={styles.avatar}></div>
      </div>

    </header>
  );
}