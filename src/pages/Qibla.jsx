import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Navigation, MapPin } from 'lucide-react';
import styles from './Qibla.module.css';

const CITIES = [
  { name: 'Casablanca (الدار البيضاء)', lat: 33.5731, lng: -7.5898 },
  { name: 'Rabat (الرباط)', lat: 34.0209, lng: -6.8416 },
  { name: 'Marrakech (مراكش)', lat: 31.6295, lng: -7.9811 },
  { name: 'Fes (فاس)', lat: 34.0181, lng: -5.0078 },
  { name: 'Tangier (طنجة)', lat: 35.7595, lng: -5.8340 },
  { name: 'Agadir (أكادير)', lat: 30.4278, lng: -9.5981 },
  { name: 'Oujda (وجدة)', lat: 34.6867, lng: -1.9114 },
  { name: 'Mecca (مكة المكرمة)', lat: 21.4225, lng: 39.8262 },
  { name: 'Medina (المدينة المنورة)', lat: 24.4672, lng: 39.6111 },
  { name: 'Cairo (القاهرة)', lat: 30.0444, lng: 31.2357 },
  { name: 'Riyadh (الرياض)', lat: 24.7136, lng: 46.6753 },
  { name: 'London (لندن)', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris (باريس)', lat: 48.8566, lng: 2.3522 },
  { name: 'New York (نيويورك)', lat: 40.7128, lng: -74.0060 },
  { name: 'Jakarta (جاكرتا)', lat: -6.2088, lng: 106.8456 }
];

function getQiblaBearing(lat, lng) {
  const phi1 = lat * Math.PI / 180;
  const phi2 = 21.422487 * Math.PI / 180; // Kaaba Latitude
  const deltaLambda = (39.826206 - lng) * Math.PI / 180; // Kaaba Longitude - user Longitude
  
  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);
  
  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = qiblaRad * 180 / Math.PI;
  return (qiblaDeg + 360) % 360;
}

export default function Qibla() {
  const [heading, setHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(110.1); // default to Casablanca
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [locationName, setLocationName] = useState('Casablanca (Default)');
  const [selectedCityIdx, setSelectedCityIdx] = useState(0);
  const [gpsError, setGpsError] = useState(null);

  // Geolocation effect
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const bearing = getQiblaBearing(latitude, longitude);
          setQiblaDirection(Math.round(bearing * 10) / 10);
          setLocationName(`Current Location (${Math.round(latitude * 100) / 100}°, ${Math.round(longitude * 100) / 100}°)`);
          setGpsError(null);
          setIsCalibrating(false);
        },
        (error) => {
          console.warn("GPS Access denied or failed, falling back to Casa", error);
          setGpsError("GPS denied/unavailable. Using City selection.");
          setIsCalibrating(false);
          // default Casablanca
          const bearing = getQiblaBearing(33.5731, -7.5898);
          setQiblaDirection(Math.round(bearing * 10) / 10);
          setLocationName('Casablanca');
        }
      );
    } else {
      setGpsError("Geolocation not supported by browser.");
      setIsCalibrating(false);
    }
  }, []);

  // Device orientation / compass sensor effect
  useEffect(() => {
    const handleOrientation = (e) => {
      let headingAngle = 0;
      if (e.webkitCompassHeading !== undefined) {
        headingAngle = e.webkitCompassHeading;
      } else if (e.alpha !== null) {
        headingAngle = 360 - e.alpha;
      }
      setHeading(Math.round(headingAngle));
    };

    const setupCompass = async () => {
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation, true);
          }
        } catch (err) {
          console.error("Device orientation permission error", err);
        }
      } else {
        if ('ondeviceorientationabsolute' in window) {
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      }
    };

    setupCompass();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    };
  }, []);

  const handleCityChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedCityIdx(idx);
    const city = CITIES[idx];
    const bearing = getQiblaBearing(city.lat, city.lng);
    setQiblaDirection(Math.round(bearing * 10) / 10);
    setLocationName(city.name);
  };

  const handleManualRotate = () => {
    // Simulate user rotating phone / turning
    setHeading(prev => (prev + 30) % 360);
  };

  // Needle rotates to point towards Kaaba (Qibla Direction - Phone Heading)
  const needleRotation = qiblaDirection - heading;

  // Check if phone is aligned to Qibla (tolerance of +/- 5 degrees)
  const diff = Math.abs((heading - qiblaDirection + 180) % 360 - 180);
  const isAligned = diff <= 5;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className="heading-lg">Qibla Finder (اتجاه القبلة)</h2>
        <p className="text-body">Find the direction of the Kaaba from your current location using GPS or compass.</p>
      </div>

      <div className={styles.compassContainer}>
        <div className={`${styles.compassWrapper} ${isAligned ? styles.alignedCompass : ''}`}>
          <div className={styles.compassRing}></div>
          <div className={styles.cardinalPoints}>
            <span className={`${styles.point} ${styles.n}`}>N</span>
            <span className={`${styles.point} ${styles.s}`}>S</span>
            <span className={`${styles.point} ${styles.e}`}>E</span>
            <span className={`${styles.point} ${styles.w}`}>W</span>
          </div>

          <div 
            className={`${styles.needle} ${isAligned ? styles.alignedNeedle : ''}`} 
            style={{ transform: `rotate(${isCalibrating ? 0 : needleRotation}deg)` }}
          >
            <div className={styles.kaabaPointer}>
              <Navigation size={24} fill="currentColor" />
            </div>
          </div>
          <div className={styles.needleCenter}></div>
        </div>

        <Card className={styles.infoCard}>
          {isCalibrating ? (
            <div className="py-4">
              <p className="text-primary font-semibold animate-pulse">Calibrating compass...</p>
              <p className="text-small mt-2 text-secondary">Awaiting sensor data & geolocation...</p>
            </div>
          ) : (
            <div>
              <div className={styles.degreeBox}>
                {qiblaDirection}°
              </div>
              <p className={styles.locationText}>
                <MapPin size={16} className="inline mr-1" style={{ verticalAlign: 'middle', color: 'var(--accent-gold)' }} />
                Location: <strong>{locationName}</strong>
              </p>

              {isAligned ? (
                <div className={styles.alignmentAlert}>
                  ✓ Aligned with Kaaba! (محاذاة مع الكعبة)
                </div>
              ) : (
                <div className="text-small text-secondary mt-1">
                  Rotate your device to align with the arrow.
                </div>
              )}

              {/* City selector fallback */}
              <div className={styles.citySelectorWrapper}>
                <label htmlFor="city-select" className="text-small font-semibold">Select Location Manually:</label>
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

              <div className="mt-4">
                <Button onClick={handleManualRotate} variant="secondary" className="w-full">
                  Rotate Compass (Simulate Turning)
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
