import { useEffect } from 'react';
import styles from './IoTSensorModal.module.css';

export default function IoTSensorModal({ sensors, onClose }) {
  const { deviceId, property, lastSync, alertTriggeredAt, sensors: sensorList, timeline } = sensors;

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function statusClass(status) {
    if (status === 'ALERT') return styles.statusAlert;
    if (status === 'HIGH') return styles.statusHigh;
    return styles.statusNormal;
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>IoT Sensor Dashboard</div>
            <div className={styles.subtitle}>{property} &mdash; Device {deviceId}</div>
            <div className={styles.syncInfo}>Last sync: {new Date(lastSync).toLocaleString()} &nbsp;|&nbsp; Alert triggered: {new Date(alertTriggeredAt).toLocaleString()}</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.sensorGrid}>
          {(sensorList || []).map(s => (
            <div key={s.id} className={`${styles.sensorCard} ${statusClass(s.status)}`}>
              <div className={styles.sensorName}>{s.name}</div>
              <div className={styles.sensorLocation}>{s.location}</div>
              <div className={styles.sensorValue}>
                {typeof s.value === 'number' ? s.value : s.value}
                {s.unit && <span className={styles.sensorUnit}> {s.unit}</span>}
              </div>
              {s.threshold && (
                <div className={styles.sensorThreshold}>Threshold: {s.threshold}{s.unit}</div>
              )}
              <div className={`${styles.sensorStatus} ${statusClass(s.status)}`}>{s.status}</div>
              {s.history && (
                <div className={styles.sparkline}>
                  {s.history.map((v, i) => (
                    <div
                      key={i}
                      className={`${styles.sparkDot} ${i === s.history.length - 1 ? styles.sparkDotLast : ''}`}
                      title={String(v)}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.timelineSection}>
          <div className={styles.timelineTitle}>Event Timeline</div>
          <div className={styles.timeline}>
            {(timeline || []).map((ev, i) => (
              <div key={i} className={`${styles.timelineItem} ${styles[`severity--${ev.severity}`]}`}>
                <div className={styles.timelineTime}>{ev.time}</div>
                <div className={styles.timelineDot} />
                <div className={styles.timelineEvent}>{ev.event}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <span className={styles.footerNote}>Data sourced from Carrier Smart Home Integration &mdash; Evidence-grade logs</span>
          <button className="btn btn--outline btn--sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
