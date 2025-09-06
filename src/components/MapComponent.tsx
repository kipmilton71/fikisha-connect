import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface MapComponentProps {
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  driverLocation?: { lat: number; lng: number };
  deliveryLocation?: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number };
  showRoute?: boolean;
  height?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  onLocationSelect,
  driverLocation,
  deliveryLocation,
  pickupLocation,
  showRoute = false,
  height = '400px'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [needsToken, setNeedsToken] = useState(true);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [36.8219, -1.2921], // Nairobi coordinates
      zoom: 12
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for location selection
    if (onLocationSelect) {
      map.current.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
          );
          const data = await response.json();
          const address = data.features[0]?.place_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          
          onLocationSelect([lng, lat], address);
        } catch (error) {
          console.error('Geocoding error:', error);
          onLocationSelect([lng, lat], `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      });
    }

    setNeedsToken(false);
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add pickup location marker
    if (pickupLocation) {
      new mapboxgl.Marker({ color: '#10B981' })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Pickup Location</div>'))
        .addTo(map.current);
    }

    // Add delivery location marker
    if (deliveryLocation) {
      new mapboxgl.Marker({ color: '#EF4444' })
        .setLngLat([deliveryLocation.lng, deliveryLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Delivery Location</div>'))
        .addTo(map.current);
    }

    // Add driver location marker
    if (driverLocation) {
      new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<div>Driver Location</div>'))
        .addTo(map.current);
    }

    // Fit bounds to show all markers
    if ((pickupLocation || deliveryLocation || driverLocation) && map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      
      if (pickupLocation) bounds.extend([pickupLocation.lng, pickupLocation.lat]);
      if (deliveryLocation) bounds.extend([deliveryLocation.lng, deliveryLocation.lat]);
      if (driverLocation) bounds.extend([driverLocation.lng, driverLocation.lat]);
      
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [pickupLocation, deliveryLocation, driverLocation]);

  if (needsToken) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Map Setup Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To use maps, you need a Mapbox access token. Get one from{' '}
            <a 
              href="https://mapbox.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              mapbox.com
            </a>
          </p>
          <Input
            type="password"
            placeholder="Enter your Mapbox access token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
          <Button 
            onClick={() => mapboxToken && initializeMap()} 
            disabled={!mapboxToken}
            className="w-full"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Initialize Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full rounded-lg border"
      style={{ height }}
    />
  );
};

export default MapComponent;