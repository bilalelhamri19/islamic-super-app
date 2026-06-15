import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Navigation, MapPin, RefreshCw } from 'lucide-react';
import styles from './Qibla.module.css';

const CITIES = [
  { name: 'الدار البيضاء', lat: 33.5731, lng: -7.5898 },
  { name: 'الرباط', lat: 34.0209, lng: -6.8416 },
  { name: 'مراكش', lat: 31.6295, lng: -7.9811 },
  { name: 'فاس', lat: 34.0181, lng: -5.0078 },
  { name: 'طنجة', lat: 35.7595, lng: -5.8340 },
  { name: 'أكادير', lat: 30.4278, lng: -9.5981 },
  { name: 'وجدة', lat: 34.6867, lng: -1.9114 },
  { name: 'مكة المكرمة', lat: 21.4225, lng: 39.8262 },
  { name: 'المدينة المنورة', lat: 24.4672, lng: 39.6111 },
  { name: 'القاهرة', lat: 30.0444, lng: 31.2357 },
  { name: 'الرياض', lat: 24.7136, lng: 46.6753 },
  { name: 'لندن', lat: 51.5074, lng: -0.1278 },
  { name: 'باريس', lat: 48.8566, lng: 2.3522 },
  { name: 'نيويورك', lat: 40.7128, lng: -74.0060 },
];

function getQiblaBearing(lat, lng) {
  const phi1 = lat * Math.PI / 180;
  const phi2 = 21.422487 * Math.PI / 180;
  const deltaLambda = (39.826206 - lng) * Math.PI / 180;
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  let qiblaDeg = Math.atan2(y, x) * 180 / Math.PI;
  return (qiblaDeg + 360) % 360;
}

export default function Qibla() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(110.1);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [locationName, setLocationName] = useState('الدار البيضاء');
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('loading'); // 'loading' | 'granted' | 'denied'

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const bearing = getQiblaBearing(latitude, longitude);
          setQiblaDirection(Math.round(bearing * 10) / 10);
          setLocationName(`موقعك الحالي (${Math.round(latitude * 100) / 100}°، ${Math.round(longitude * 100) / 100}°)`);
          setGpsStatus('granted');
          setIsCalibrating(false);
        },
        () => {
          setGpsStatus('denied');
          setIsCalibrating(false);
          const bearing = getQiblaBearing(33.5731, -7.5898);
          setQiblaDirection(Math.round(bearing * 10) / 10);
          setLocationName('الدار البيضاء (افتراضي)');
        }
      );
    } else {
      setGpsStatus('denied');
      setIsCalibrating(false);
    }
  }, []);

  useEffect(() => {
    const handleOrientation = (e) => {
      let angle = e.webkitCompassHeading !== undefined ? e.webkitCompassHeading : (360 - (e.alpha || 0));
      setHeading(Math.round(angle));
    };
    const setup = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          if (perm === 'granted') window.addEventListener('deviceorientation', handleOrientation, true);
        } catch (e) {}
      } else {
        window.addEventListener('deviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation', handleOrientation, true);
      }
    };
    setup();
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    };
  }, []);

  const handleCityChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedCityIdx(idx);
    const city = CITIES[idx];
    setQiblaDirection(Math.round(getQiblaBearing(city.lat, city.lng) * 10) / 10);
    setLocationName(city.name);
  };

  const needleRotation = qiblaDirection - heading;
  const diff = Math.abs((heading - qiblaDirection + 180) % 360 - 180);
  const isAligned = diff <= 5;

  return (
    <div className={styles.container}>

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageLabel}>اتجاه الصلاة</p>
          <h2 className={styles.pageTitle}>اتجاه القبلة</h2>
          <p className={styles.pageSub}>وجّه نفسك نحو الكعبة المشرفة أينما كنت</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className={styles.mainLayout}>

        {/* Compass */}
        <div className={styles.compassSection}>
          <div className={`${styles.compassWrapper} ${isAligned ? styles.alignedCompass : ''}`}>
            {/* Outer glow ring */}
            <div className={`${styles.glowRing} ${isAligned ? styles.glowAligned : ''}`} />

            {/* Cardinal labels */}
            <div className={styles.cardinalPoints}>
              <span className={`${styles.point} ${styles.n}`}>ش</span>
              <span className={`${styles.point} ${styles.s}`}>ج</span>
              <span className={`${styles.point} ${styles.e}`}>ق</span>
              <span className={`${styles.point} ${styles.w}`}>غ</span>
            </div>

            {/* Needle */}
            <div
              className={`${styles.needle} ${isAligned ? styles.needleAligned : ''}`}
              style={{ transform: `rotate(${isCalibrating ? 0 : needleRotation}deg)`, transition: 'transform 0.4s ease' }}
            >
              <div className={styles.kaabaPointer}>
                <Navigation size={28} fill="currentColor" />
                <span className={styles.kaabaLabel}>الكعبة</span>
              </div>
            </div>

            <div className={styles.compassCenter} />
          </div>

          {isAligned && (
            <div className={styles.alignedBadge}>
              ✓ أنت متوجه نحو القبلة!
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className={styles.infoPanel}>

          {/* Direction Display */}
          <div className={styles.directionCard}>
            <p className={styles.directionLabel}>اتجاه القبلة</p>
            <p className={styles.directionValue}>{isCalibrating ? '---' : `${qiblaDirection}°`}</p>
          </div>

          {/* GPS Status */}
          <div className={`${styles.statusCard} ${gpsStatus === 'granted' ? styles.statusGranted : styles.statusDenied}`}>
            <MapPin size={15} />
            <div>
              <p className={styles.statusTitle}>{gpsStatus === 'granted' ? 'GPS مفعّل' : 'GPS غير متاح'}</p>
              <p className={styles.statusSub}>{locationName}</p>
            </div>
          </div>

          {/* City Selector */}
          <div className={styles.selectorCard}>
            <label htmlFor="city-select" className={styles.selectorLabel}>
              اختر مدينة يدوياً
            </label>
            <select
              id="city-select"
              className={styles.citySelect}
              value={selectedCityIdx}
              onChange={handleCityChange}
            >
              {CITIES.map((city, idx) => (
                <option key={idx} value={idx}>{city.name}</option>
              ))}
            </select>
          </div>

          {/* Heading Info */}
          <div className={styles.headingCard}>
            <div className={styles.headingRow}>
              <span className={styles.headingLabel}>اتجاه جهازك</span>
              <span className={styles.headingValue}>{heading}°</span>
            </div>
            <div className={styles.headingRow}>
              <span className={styles.headingLabel}>الفرق</span>
              <span className={`${styles.headingValue} ${isAligned ? styles.alignedText : ''}`}>
                {isCalibrating ? '---' : `${Math.round(diff)}°`}
              </span>
            </div>
          </div>

          {/* Instructions */}
          <div className={styles.instructionBox}>
            <p className={styles.instructionText}>
              📱 وجّه هاتفك حتى يشير السهم نحو الأعلى — عندها ستكون متوجهاً نحو الكعبة المشرفة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
