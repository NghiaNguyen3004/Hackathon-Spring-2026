import styles from "./PostCard.module.css";

type PostCardProps = {
  username: string;
  content: string;
};

export default function PostCard({ username, content }: PostCardProps) {
  return (
    <div className={styles.card}>
      
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.avatar}></div>
        <h3 className={styles.username}>{username}</h3>
      </div>

      {/* Content */}
      <p className={styles.content}>{content}</p>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.accept}>Accept</button>
        <button className={styles.ignore}>Ignore</button>
        <button className={styles.share}>Share</button>
      </div>

    </div>
  );
}