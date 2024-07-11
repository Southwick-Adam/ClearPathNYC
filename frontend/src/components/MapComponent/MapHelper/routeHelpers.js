import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import { animateMarkers, addClusteredLayer } from './markerHelpers';
import { convertToGeoJSON } from './geojsonHelpers.js';
import useStore from '../../../store/store.js';

export function addRouteToMap(mapRef) {
  const route = useStore.getState().route;

  if (!route) {
    console.error('No route found in store.');
    return;
  }

  if (mapRef.current.getSource('route')) {
    mapRef.current.getSource('route').setData(route);
  } else {
    mapRef.current.addSource('route', {
      type: 'geojson',
      data: route,
      lineMetrics: true,
    });

    mapRef.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-width': 10,
        'line-gradient': [
          'interpolate',
          ['linear'],
          ['line-progress'],
          0, '#ff0000',
          0.33, '#ffff00',
          0.66, '#00ff00',
          1, '#00ff00'
        ],
      },
    });
  }
}

export function addRouteMarkers(mapRef, routeData, startMarkerRef, endMarkerRef) {
  const startCoord = routeData.features[0].geometry.coordinates[0];
  const endCoord = routeData.features[0].geometry.coordinates[routeData.features[0].geometry.coordinates.length - 1];

  if (endMarkerRef.current) {
    endMarkerRef.current.remove();
    endMarkerRef.current = null;
  }

  if (startMarkerRef.current) {
    startMarkerRef.current.setLngLat(startCoord);
  } else {
    const startMarker = document.createElement('div');
    startMarker.className = 'marker start_marker';

    startMarkerRef.current = new mapboxgl.Marker({
      element: startMarker,
      offset: [0, -15]
    })
      .setLngLat(startCoord)
      .addTo(mapRef.current);

      animateMarkers($(startMarker));
  }

  const isLoop = routeData.features[0].properties.isLoop;

  if (!isLoop) {
    if (endMarkerRef.current) {
      endMarkerRef.current.setLngLat(endCoord);
    } else {
      const endMarker = document.createElement('div');
      endMarker.className = 'marker end_marker';

      endMarkerRef.current = new mapboxgl.Marker({
        element: endMarker,
        offset: [0, -15]
      })
        .setLngLat(endCoord)
        .addTo(mapRef.current);

        animateMarkers($(endMarker));
    }
  }
}

export function zoomToRoute(mapRef, route, helpers) {
  const { plotRoutePOI, poiGeojson, fetchNoise311, fetchGarbage311, fetchOther311, fetchMulti311, add311Markers, add311Multiple } = helpers;

  if (!route.features || !Array.isArray(route.features) || route.features.length === 0) {
    console.error('Invalid route data');
    return;
  }

  const coordinates = route.features[0].geometry.coordinates;
  let bounds = coordinates.reduce((bounds, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

  const expandFactor = 0.0001;
  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();
  bounds = bounds.extend([northEast.lng + expandFactor, northEast.lat + expandFactor]);
  bounds = bounds.extend([southWest.lng - expandFactor, southWest.lat - expandFactor]);

  mapRef.current.fitBounds(bounds, { padding: 100 });

  plotRoutePOI(mapRef, poiGeojson, bounds);

  const noise311 = fetchNoise311().filter(location => bounds.contains(location.coordinates));
  const garbage311 = fetchGarbage311().filter(location => bounds.contains(location.coordinates));
  const other311 = fetchOther311().filter(location => bounds.contains(location.coordinates));
  const multi311 = fetchMulti311().filter(location => bounds.contains(location.coordinates));

  const noise311high = convertToGeoJSON(noise311.filter(location => (location.category === "High")));
  const noise311veryhigh = convertToGeoJSON(noise311.filter(location => (location.category === "Very High")));
  const garbagehigh = convertToGeoJSON(garbage311);
  const otherhigh = convertToGeoJSON(other311);
  const multihigh = convertToGeoJSON(multi311.filter(location => (location.severity === "High")));
  const multiveryhigh = convertToGeoJSON(multi311.filter(location => (location.severity === "Very High")));

  addClusteredLayer(mapRef, noise311high, 'route-noise-h', 'noise-high-marker', 'orange');
  addClusteredLayer(mapRef, noise311veryhigh, 'route-noise-vh', 'noise-veryhigh-marker', 'red');
  addClusteredLayer(mapRef, garbagehigh, 'route-garbage-h', 'garbage-high-marker', 'orange');
  addClusteredLayer(mapRef, otherhigh, 'route-other-h', 'other-high-marker', 'orange');
  addClusteredLayer(mapRef, multihigh, 'route-multi-h', 'multi-high-marker', 'orange');
  addClusteredLayer(mapRef, multiveryhigh, 'route-multi-vh', 'multi-veryhigh-marker', 'red');
}

export function clearRoute(mapRef) {
  if (mapRef.current.getSource('route')) {
    mapRef.current.removeLayer('route');
    mapRef.current.removeSource('route');
  }
  if (mapRef.current.getLayer('start-marker')) {
    mapRef.current.removeLayer('start-marker');
  }
  if (mapRef.current.getLayer('end-marker')) {
    mapRef.current.removeLayer('end-marker');
  }
}
