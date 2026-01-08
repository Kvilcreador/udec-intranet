import styles from './RiskBadge.module.css';

export default function RiskBadge({ level }) {
    const normalized = level?.toLowerCase() || 'low';

    let label = 'Normal';
    if (normalized === 'medium') label = 'Alerta';
    if (normalized === 'high') label = 'Crítico';

    return (
        <span className={`${styles.badge} ${styles[normalized]}`}>
            {label}
        </span>
    );
}
