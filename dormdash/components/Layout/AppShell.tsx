import { ReactNode, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import styles from "./AppShell.module.css";
import RequestModal from "../RequestModal/RequestModal";

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
          
        
          </aside>
        </div>
      </div>
    </main>
  );
}

