import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx(styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Get Started with TrinaryVM 🚀
          </Link>
          <Link className="button button--outline button--lg" to="/docs/turbo-vliw">
            Explore TurboVLIW Dashboard 📊
          </Link>
        </div>
        <div className={styles.quickNav}>
          <div className={styles.navGrid}>
            <Link to="/docs/turbo-vliw" className={styles.navCard}>
              <div className={styles.navIcon}>⚡</div>
              <h3>TurboVLIW</h3>
              <p>Real-time VLIW processing dashboard</p>
            </Link>
            <Link to="/docs/security" className={styles.navCard}>
              <div className={styles.navIcon}>🔒</div>
              <h3>Security</h3>
              <p>TriFHE encryption & endpoint protection</p>
            </Link>
            <Link to="/docs/hardware" className={styles.navCard}>
              <div className={styles.navIcon}>⚙️</div>
              <h3>Hardware</h3>
              <p>CUDA, FPGA & ASIC acceleration</p>
            </Link>
            <Link to="/docs/api" className={styles.navCard}>
              <div className={styles.navIcon}>🔌</div>
              <h3>API</h3>
              <p>REST, GraphQL & WebSocket APIs</p>
            </Link>
            <Link to="/docs/development/cli" className={styles.navCard}>
              <div className={styles.navIcon}>💻</div>
              <h3>CLI</h3>
              <p>Command-line interface reference</p>
            </Link>
            <Link to="/docs/getting-started" className={styles.navCard}>
              <div className={styles.navIcon}>🎓</div>
              <h3>Learning</h3>
              <p>Tutorials & certification programs</p>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Enterprise Post-Quantum Virtual Machine`}
      description="TrinaryVM is an enterprise-grade post-quantum virtual machine with ternary logic architecture, VLIW processing, and zero-trust security protocols.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
