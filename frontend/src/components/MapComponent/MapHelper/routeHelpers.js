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

  // Extract coordinates and quietness score from the route data
  const coordinates = route.features[0].geometry.coordinates;
  const quietnessScore = route.features[0].properties.quietness_score;

  // Create a GeoJSON line string with properties including quietness score
  const lineString = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };

  if (mapRef.current.getSource('route')) {
    mapRef.current.getSource('route').setData(lineString);
  } else {
    mapRef.current.addSource('route', {
      type: 'geojson',
      data: lineString,
      lineMetrics: true,
    });

    // Prepare the line gradient stops based on quietness score
    const lineGradient = ['interpolate', ['linear'], ['line-progress']];
    for (let i = 0; i < quietnessScore.length; i++) {
      const progress = i / (quietnessScore.length - 1);
      const color = getColorForQuietness(quietnessScore[i]);
      lineGradient.push(progress, color);
    }

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
        'line-gradient': lineGradient,
      },
    });
  }
}

// Function to map quietness score to a color
function getColorForQuietness(score) {
  // Define a color scale for quietness scores (example: green to red)
  if (score < 100) return '#00FF00'; // Green for low scores (quiet)
  if (score < 200) return 'orange'; // Yellow for medium scores
  return '#FF0000'; // Red for high scores (noisy)
}

// Function to add markers with animations
export function addRouteMarkers(mapRef, routeData, startMarkerRef, endMarkerRef, waypointRefs) {
  const startCoord = routeData.features[0].geometry.coordinates[0];
  const endCoord = routeData.features[0].geometry.coordinates[routeData.features[0].geometry.coordinates.length - 1];

  // Clear existing waypoint markers
  waypointRefs.forEach(ref => {
    if (ref.current) {
      ref.current.remove();
      ref.current = null;
    }
  });

  const { waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5, visibleWaypoints } = useStore.getState();

  const waypointCoords = [waypointCord1, waypointCord2, waypointCord3, waypointCord4, waypointCord5];
  const waypointClasses = ['waypoint1_marker', 'waypoint2_marker', 'waypoint3_marker', 'waypoint4_marker', 'waypoint5_marker'];

  // Draw markers in sequence
  let timeout = 0;

  // Add start marker
  setTimeout(() => {
    if (startMarkerRef.current) {
      startMarkerRef.current.setLngLat(startCoord);
    } else {
      const startMarker = document.createElement('div');
      startMarker.className = 'marker start_marker bounce'; // Add bounce class

      startMarkerRef.current = new mapboxgl.Marker({
        element: startMarker,
        offset: [0, -15]
      })
        .setLngLat(startCoord)
        .addTo(mapRef.current);

      animateMarkers($(startMarker));
    }
  }, timeout);

  timeout += 1000; // Adjust delay as needed

  // Add waypoint markers
  for (let i = 0; i < visibleWaypoints; i++) {
    if (waypointCoords[i]) {
      setTimeout(() => {
        const waypointMarker = document.createElement('div');
        waypointMarker.className = `marker ${waypointClasses[i]}`;

        waypointRefs[i].current = new mapboxgl.Marker({
          element: waypointMarker,
          offset: [0, -15]
        })
          .setLngLat(waypointCoords[i])
          .addTo(mapRef.current);

        animateMarkers($(waypointMarker));
      }, timeout);

      timeout += 500; // Adjust delay as needed
    }
  }

  // Add end marker
  setTimeout(() => {
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
  }, timeout);
}


export function zoomToRoute(mapRef, route, helpers) {
  const { fetchNoise311, fetchGarbage311, fetchOther311, fetchMulti311, add311Markers, add311Multiple } = helpers;

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

  const pitch = 50;
  const bearing = -2.6;
  const center = bounds.getCenter();
  const zoom = mapRef.current.getZoom();

  setTimeout(() => {
    mapRef.current.easeTo({
      center: center,
      zoom: zoom,
      pitch: pitch,
      bearing: bearing,
      duration: 1000
    });
  }, 0);

  mapRef.current.fitBounds(bounds, { padding: 100 });

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
