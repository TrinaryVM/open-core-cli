import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Ternary Logic Architecture',
    Svg: require('@site/static/img/neon_ternary.svg').default,
    description: (
      <>
        TrinaryVM implements three-state logic (-1, 0, +1) instead of traditional binary computing,
        providing enhanced computational capabilities and quantum-resistant operations.
      </>
    ),
  },
  {
    title: 'VLIW Processing',
    Svg: require('@site/static/img/neon_vliw.svg').default,
    description: (
      <>
        Very Long Instruction Word architecture enables parallel execution of multiple operations
        in a single instruction cycle, maximizing performance and efficiency.
      </>
    ),
  },
  {
    title: 'TriFHE Security',
    Svg: require('@site/static/img/neon_trifhe.svg').default,
    description: (
      <>
        Trinary Fully Homomorphic Encryption provides quantum-resistant security for all operations,
        ensuring data privacy and protection against quantum attacks.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
