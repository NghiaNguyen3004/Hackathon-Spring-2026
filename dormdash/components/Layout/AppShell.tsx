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
        <Header username={username} />

        <div className={styles.body}>
          <div className={styles.sidebarArea}>
            <Sidebar />
          </div>

          <section className={styles.contentArea}>{children}</section>

          <aside className={styles.rightArea}>
          

          <Link href = "/request"
          className = "flex-1 bg-red hover:bg-gray-300 text-gray-600 text-sm font-semibold py-3 text-center transition-colors duration-200 rounded-md">
            +
          </Link>
          
          </aside>
        </div>
      </div>
    </main>
  );
}