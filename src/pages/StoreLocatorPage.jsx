/**
 * StoreLocatorPage - Simplified version
 * Find nearby Kroger and partner stores using geolocation + OpenStreetMap
 */

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/StoreLocatorPage.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STORES_DATA = [
  { id: 'kroger', name: 'Kroger', color: '#FF6600' },
  { id: 'costco', name: 'Costco', color: '#0066cc' },
  { id: 'walmart', name: 'Walmart', color: '#0071ce' },
  { id: 'aldi', name: 'ALDI', color: '#E4001B' },
  { id: 'target', name: 'Target', color: '#cc0000' },
  { id: 'sprouts', name: 'Sprouts Farmers Market', color: '#228b22' },
];

export default function StoreLocatorPage() {
  const navigate = useNavigate();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});

  const [userLocation, setUserLocation] = useState(null);
  const [allStores, setAllStores] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [radius, setRadius] = useState(10);
  const [selectedStoreTypes, setSelectedStoreTypes] = useState(
    STORES_DATA.map(s => s.id)
  );

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      map.current = L.map(mapContainer.current).setView([39.8283, -98.5795], 4);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map');
    }

    return () => {
      // Keep map alive
    };
  }, []);

  // Refetch when radius changes and we already have a location
  useEffect(() => {
    if (userLocation) {
      loadStores(userLocation.lat, userLocation.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  // Re-filter markers when store type selection changes
  useEffect(() => {
    if (!userLocation) return;

    const filtered = allStores.filter((s) => selectedStoreTypes.includes(s.storeType));
    setStores(filtered);
    displayStoresOnMap(filtered, userLocation.lat, userLocation.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStoreTypes, allStores, userLocation]);

  // Get user location
  const handleGetLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);

        if (map.current) {
          map.current.setView([latitude, longitude], 12);
          
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#2196F3',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }).addTo(map.current).bindPopup('Your Location');
        }

        loadStores(latitude, longitude);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setLoading(false);
      }
    );
  };

  // Load stores
  const loadStores = async (lat, lng) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lng: String(lng),
        radius: String(radius),
        limit: '25',
      });

      const response = await fetch(`/api/stores/nearby?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load stores');
      }

      const liveStores = (payload?.stores || []).map((store) => ({
        id: store.id,
        name: store.name,
        storeType: store.storeType || 'kroger',
        lat: store.lat,
        lng: store.lng,
        address: store.address || 'Address unavailable',
        phone: store.phone,
        distance: store.distanceMiles,
      }));

      const filtered = liveStores.filter((s) => selectedStoreTypes.includes(s.storeType));

      setStores(filtered);
      displayStoresOnMap(filtered, lat, lng);
      setError(null);
    } catch (err) {
      console.error(err);

      // Graceful fallback when backend not configured yet
      const fallbackStores = [
        { id: 'demo-1', name: 'Kroger - Downtown', storeType: 'kroger', lat: lat + 0.05, lng: lng + 0.05, address: '123 Main St' },
        { id: 'demo-2', name: 'Walmart Supercenter', storeType: 'walmart', lat: lat - 0.05, lng: lng - 0.05, address: '456 Oak Ave' },
        { id: 'demo-3', name: 'Costco', storeType: 'costco', lat: lat + 0.03, lng: lng - 0.03, address: '789 Industrial Blvd' },
      ];

      const filtered = fallbackStores.filter((s) => selectedStoreTypes.includes(s.storeType));
      setStores(filtered);
      displayStoresOnMap(filtered, lat, lng);
      setError('Live store lookup unavailable. Showing sample locations.');
    } finally {
      setLoading(false);
    }
  };

  // Display stores on map
  const displayStoresOnMap = (storeList, userLat, userLng) => {
    // Clear old markers
    Object.values(markersRef.current).forEach(marker => {
      if (map.current) map.current.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
    storeList.forEach((store) => {
      const storeInfo = STORES_DATA.find(s => s.id === store.storeType);
      const color = storeInfo?.color || '#666';

      const marker = L.circleMarker([store.lat, store.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map.current);

      marker.bindPopup(`<strong>${store.name}</strong><br/>${store.address}`);
      markersRef.current[store.id] = marker;
    });

    // Fit bounds
    if (storeList.length > 0 && map.current && userLat && userLng) {
      const bounds = L.latLngBounds(
        storeList.map(s => [s.lat, s.lng]).concat([[userLat, userLng]])
      );
      map.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="store-locator-container">
      <div className="store-locator-header">
        <div className="header-content">
          <h1>🗺️ Find Nearby Stores</h1>
          <p>Discover your closest shopping options</p>
        </div>
        <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="store-locator-main">
        {/* Map */}
        <div className="map-section">
          <div ref={mapContainer} className="leaflet-map" />
          {selectedStore && (
            <div className="store-detail-popup">
              <button className="close-button" onClick={() => setSelectedStore(null)}>×</button>
              <h3>{selectedStore.name}</h3>
              <p className="store-address">{selectedStore.address}</p>
              {userLocation && (
                <p className="store-distance">
                  📍 {calculateDistance(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng).toFixed(1)} miles
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          <div className="control-section">
            <h3>📍 Your Location</h3>
            <button className="locate-button" onClick={handleGetLocation} disabled={loading}>
              {loading ? 'Getting Location...' : 'Find My Location'}
            </button>
            {userLocation && (
              <p className="location-info">
                {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </p>
            )}
            {error && <p className="error-message">{error}</p>}
          </div>

          {userLocation && (
            <>
              <div className="control-section">
                <h3>📏 Search Radius</h3>
                <div className="radius-control">
                  <input type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
                  <span className="radius-value">{radius} mi</span>
                </div>
              </div>

              <div className="control-section">
                <h3>🏪 Store Types</h3>
                <div className="store-filters">
                  {STORES_DATA.map(store => (
                    <label key={store.id} className="filter-checkbox">
                      <input 
                        type="checkbox"
                        checked={selectedStoreTypes.includes(store.id)}
                        onChange={() => {
                          const updated = selectedStoreTypes.includes(store.id)
                            ? selectedStoreTypes.filter(id => id !== store.id)
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
                          {userLocation && (
                            <span className="store-distance-badge">
                              {calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng).toFixed(1)}mi
                            </span>
                          )}
                        </div>
                        <p className="store-item-address">{store.address}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-results">Click 'Find My Location' to see nearby stores</p>
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

