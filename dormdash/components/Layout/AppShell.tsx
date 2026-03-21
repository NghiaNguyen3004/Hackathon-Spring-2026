import { ReactNode } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./AppShell.module.css";

type AppShellProps = {
  children: ReactNode;
  username?: string;
};

export default function AppShell({
  children,
  username = "Username",
}: AppShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Header username={username} />

        <div className={styles.body}>
          <div className={styles.sidebarArea}>
            <Sidebar />
          </div>

          <section className={styles.contentArea}>{children}</section>

          <aside className={styles.rightArea}>
          

            <button className={styles.fab}>+</button>
          </aside>
        </div>
      </div>
    </main>
  );
}