import Sidebar from './Sidebar';
import TopNav from './TopNav';
import StellaPanel from '../stella/StellaPanel';
import styles from './Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <TopNav />
      <main className={styles.main}>
        {children}
      </main>
      <StellaPanel />
    </div>
  );
}
