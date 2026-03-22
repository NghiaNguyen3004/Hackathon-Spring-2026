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

  const [show, setShow] = useState(false);
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
          
          <button className={styles.fab} onClick={() => setShow(true)}>+</button>
          <RequestModal isOpen = {show} onClose ={() => setShow(false)}>  
            <h1>Hi</h1>
          </RequestModal>
          </aside>
        </div>
      </div>
    </main>
  );
}

