import { ReactNode } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./AppShell.module.css";
import Link from "next/link";

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
        <Header/>

        <div className={styles.body}>
          <div className={styles.sidebarArea}>
            <Sidebar />
          </div>

          <section className={styles.contentArea}>{children}</section>

          <aside className={styles.rightArea}>
          

          <button className = {styles.button}>+</button>
          
          </aside>
        </div>
      </div>
    </main>
  );
}