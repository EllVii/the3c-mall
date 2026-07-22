/**
 * StoreLocatorPage
 * Finds nearby Kroger-family stores using browser geolocation, Leaflet, and
 * the Cloudflare Pages Kroger API function.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/StoreLocatorPage.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STORES_DATA = [
  { id: 'kroger', name: 'Kroger Family', color: '#FF6600' },
  { id: 'costco', name: 'Costco', color: '#0066cc' },
  { id: 'walmart', name: 'Walmart', color: '#0071ce' },
  { id: 'aldi', name: 'ALDI', color: '#E4001B' },
  { id: 'target', name: 'Target', color: '#cc0000' },
  { id: 'sprouts', name: 'Sprouts Farmers Market', color: '#228b22' },
];

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getApiError(payload, responseStatus) {
  const attempt = Array.isArray(payload?.attempts)
    ? payload.attempts.find((item) => item?.message)
    : null;
  const message =
    payload?.message ||
    attempt?.message ||
    payload?.error ||
    `Store service returned HTTP ${responseStatus}`;
  const code = payload?.code || `http_${responseStatus}`;
  return { message: String(message), code: String(code) };
}

export default function StoreLocatorPage() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const storeMarkersRef = useRef({});
  const userMarkerRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [allStores, setAllStores] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [radius, setRadius] = useState(10);
  const [selectedStoreTypes, setSelectedStoreTypes] = useState(
    STORES_DATA.map((store) => store.id),
  );

  useEffect(() => {
    if (!mapContainer.current || map.current) return undefined;

    try {
      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
      window.setTimeout(() => map.current?.invalidateSize(), 100);
    } catch (caught) {
      console.error('Map initialization error:', caught);
      setError('The store map could not be initialized.');
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  const displayStoresOnMap = (storeList, userLat, userLng) => {
    Object.values(storeMarkersRef.current).forEach((marker) => {
      map.current?.removeLayer(marker);
    });
    storeMarkersRef.current = {};

    storeList.forEach((store) => {
      if (!Number.isFinite(Number(store.lat)) || !Number.isFinite(Number(store.lng))) return;
      const storeInfo = STORES_DATA.find((item) => item.id === store.storeType);
      const marker = L.circleMarker([store.lat, store.lng], {
        radius: 8,
        fillColor: storeInfo?.color || '#666',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map.current);

      marker.bindPopup(
        `<strong>${escapeHtml(store.name)}</strong><br/>${escapeHtml(store.address)}`,
      );
      marker.on('click', () => setSelectedStore(store));
      storeMarkersRef.current[store.id] = marker;
    });

    if (storeList.length > 0 && map.current && Number.isFinite(userLat) && Number.isFinite(userLng)) {
      const bounds = L.latLngBounds(
        storeList.map((store) => [store.lat, store.lng]).concat([[userLat, userLng]]),
      );
      map.current.fitBounds(bounds, { padding: [45, 45], maxZoom: 13 });
    }
  };

  const loadStores = async (lat, lng) => {
    setLoading(true);
    setError(null);
    setNotice('Connecting to Kroger…');

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(radius),
        limit: '25',
      });
      const response = await fetch(`/api/stores/nearby?${params.toString()}`, {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        const apiError = getApiError(payload, response.status);
        const caught = new Error(apiError.message);
        caught.code = apiError.code;
        caught.status = response.status;
        throw caught;
      }

      const liveStores = (Array.isArray(payload?.stores) ? payload.stores : []).map((store) => ({
        id: store.id,
        name: store.name,
        storeType: store.storeType || 'kroger',
        lat: Number(store.lat),
        lng: Number(store.lng),
        address: store.address || 'Address unavailable',
        phone: store.phone,
        distance: store.distanceMiles,
        isSample: false,
      }));
      const filtered = liveStores.filter((store) => selectedStoreTypes.includes(store.storeType));

      setAllStores(liveStores);
      setStores(filtered);
      displayStoresOnMap(filtered, lat, lng);
      setSelectedStore(null);

      if (payload?.environment === 'certification') {
        setNotice(`Connected to Kroger certification data. ${liveStores.length} location(s) returned.`);
      } else if (liveStores.length === 0) {
        setNotice(`Kroger connected, but no Kroger-family locations were returned within ${radius} miles.`);
      } else {
        setNotice(`${liveStores.length} Kroger-family location(s) found within ${radius} miles.`);
      }
    } catch (caught) {
      console.error('Live store lookup failed:', caught);

      const fallbackStores = [
        {
          id: 'demo-1',
          name: 'Sample Kroger marker',
          storeType: 'kroger',
          lat: lat + 0.05,
          lng: lng + 0.05,
          address: 'Demonstration only — not a real store location',
          isSample: true,
        },
        {
          id: 'demo-2',
          name: 'Sample Walmart marker',
          storeType: 'walmart',
          lat: lat - 0.05,
          lng: lng - 0.05,
          address: 'Demonstration only — not a real store location',
          isSample: true,
        },
        {
          id: 'demo-3',
          name: 'Sample Costco marker',
          storeType: 'costco',
          lat: lat + 0.03,
          lng: lng - 0.03,
          address: 'Demonstration only — not a real store location',
          isSample: true,
        },
      ];
      const filtered = fallbackStores.filter((store) => selectedStoreTypes.includes(store.storeType));

      setAllStores(fallbackStores);
      setStores(filtered);
      displayStoresOnMap(filtered, lat, lng);
      setSelectedStore(null);
      setNotice(null);
      setError(
        `Kroger connection failed [${caught?.code || 'unknown_error'}]: ${caught?.message || 'Unknown error'}. Showing clearly labeled sample markers.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) loadStores(userLocation.lat, userLocation.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  useEffect(() => {
    if (!userLocation) return;
    const filtered = allStores.filter((store) => selectedStoreTypes.includes(store.storeType));
    setStores(filtered);
    displayStoresOnMap(filtered, userLocation.lat, userLocation.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreTypes]);

  const handleGetLocation = () => {
    setLoading(true);
    setError(null);
    setNotice('Requesting your location…');

    if (!navigator.geolocation) {
      setError('This browser does not support location access.');
      setNotice(null);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        setUserLocation(location);

        if (map.current) {
          if (userMarkerRef.current) map.current.removeLayer(userMarkerRef.current);
          userMarkerRef.current = L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#2196F3',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9,
          }).addTo(map.current).bindPopup('Your approximate location');
          map.current.setView([latitude, longitude], 12);
        }

        loadStores(latitude, longitude);
      },
      (caught) => {
        setError(`Location error: ${caught.message}`);
        setNotice(null);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const earthRadiusMiles = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return earthRadiusMiles * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  return (
    <div className="store-locator-container">
      <div className="store-locator-header">
        <div className="header-content">
          <h1>Find Nearby Stores</h1>
          <p>Discover your closest shopping options</p>
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="store-locator-main">
        <div className="map-section">
          <div ref={mapContainer} className="leaflet-map" />
          {selectedStore && (
            <div className="store-detail-popup">
              <button className="close-button" onClick={() => setSelectedStore(null)}>×</button>
              <h3>{selectedStore.name}</h3>
              <p className="store-address">{selectedStore.address}</p>
              {selectedStore.isSample && <p className="error-message">Sample marker only</p>}
              {userLocation && (
                <p className="store-distance">
                  📍 {calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    selectedStore.lat,
                    selectedStore.lng,
                  ).toFixed(1)} miles
                </p>
              )}
            </div>
          )}
        </div>

        <div className="sidebar">
          <div className="control-section">
            <h3>📍 Your Location</h3>
            <button className="locate-button" onClick={handleGetLocation} disabled={loading}>
              {loading ? 'Finding Stores…' : 'Find My Location'}
            </button>
            {userLocation && (
              <p className="location-info">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
            {notice && <p className="location-info">{notice}</p>}
            {error && <p className="error-message">{error}</p>}
          </div>

          {userLocation && (
            <>
              <div className="control-section">
                <h3>📏 Search Radius</h3>
                <div className="radius-control">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={radius}
                    onChange={(event) => setRadius(Number(event.target.value))}
                  />
                  <span className="radius-value">{radius} mi</span>
                </div>
              </div>

              <div className="control-section">
                <h3>🏪 Store Types</h3>
                <div className="store-filters">
                  {STORES_DATA.map((store) => (
                    <label key={store.id} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedStoreTypes.includes(store.id)}
                        onChange={() => {
                          const updated = selectedStoreTypes.includes(store.id)
                            ? selectedStoreTypes.filter((id) => id !== store.id)
                            : [...selectedStoreTypes, store.id];
                          setSelectedStoreTypes(updated);
                        }}
                      />
                      <span className="filter-dot" style={{ backgroundColor: store.color }} />
                      {store.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="control-section results-section">
                <h3>📊 Results ({stores.length})</h3>
                <div className="store-list">
                  {stores.length > 0 ? (
                    stores.map((store) => (
                      <div
                        key={store.id}
                        className={`store-item ${selectedStore?.id === store.id ? 'active' : ''}`}
                        onClick={() => setSelectedStore(store)}
                      >
                        <div className="store-item-header">
                          <h4>{store.name}</h4>
                          <span className="store-distance-badge">
                            {calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              store.lat,
                              store.lng,
                            ).toFixed(1)}mi
                          </span>
                        </div>
                        <p className="store-item-address">{store.address}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">No matching stores found in this radius.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
