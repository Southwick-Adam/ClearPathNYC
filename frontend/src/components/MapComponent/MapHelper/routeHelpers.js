import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import { animateMarkers, addClusteredLayer } from './markerHelpers';
import { convertToGeoJSON } from './geojsonHelpers.js';
import useStore from '../../../store/store.js';
import * as turf from '@turf/turf';

export function addRouteToMap(mapRef) {
  const route = useStore.getState().route;

  if (!route) {
    console.error('No route found in store.');
    return;
  }

  // Extract coordinates and quietness score from the route data
  const coordinates = route.features[0].geometry.coordinates;
  const quietnessScore = route.features[0].properties.quietness_score;

  // Calculate the thresholds for the quietness scores
  const thresholds = calculateThresholds(quietnessScore);

  if (!thresholds) {
    console.error('Could not calculate thresholds for quietness scores.');
    return;
  }

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
      const color = getColorForQuietness(quietnessScore[i], thresholds);
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

    // Add a tooltip for the longest red segment in the route
    addRouteTooltips(mapRef, coordinates, quietnessScore);
  }
}

function calculateThresholds(scores) {
  if (!Array.isArray(scores) || scores.length === 0) {
    console.error('Invalid scores array:', scores);
    return null;
  }

  const sortedScores = [...scores].sort((a, b) => a - b);
  const oneThirdIndex = Math.floor(sortedScores.length / 3);
  const twoThirdIndex = Math.floor((2 * sortedScores.length) / 3);

  return {
    lowThreshold: sortedScores[oneThirdIndex],
    highThreshold: sortedScores[twoThirdIndex],
  };
}

// Function to map quietness score to a color using pre-calculated thresholds
function getColorForQuietness(score, thresholds) {
  if (!thresholds) {
    console.error('Thresholds are not defined:', thresholds);
    return '#000000'; // Default to black in case of an error
  }

  const { lowThreshold, highThreshold } = thresholds;

  // Define a color scale for quietness scores
  if (score <= lowThreshold) return '#00FF00'; // Green for low scores (quiet)
  if (score <= highThreshold) return 'orange'; // Orange for medium scores
  return '#FF0000'; // Red for high scores (noisy)
}

function addRouteTooltips(mapRef, coordinates, quietnessScore) {
  const segmentLengths = {};
  let currentColor = null;
  let currentSegmentStart = null;

  function addSegmentLength(color, start, end) {
    if (!segmentLengths[color]) {
      segmentLengths[color] = [];
    }
    const length = turf.distance(turf.point(start), turf.point(end));
    segmentLengths[color].push({ start, end, length });
  }

  for (let i = 0; i < coordinates.length - 1; i++) {
    const score = quietnessScore[i];
    const color = getColorForQuietness(score, calculateThresholds(quietnessScore));
    const nextCoord = coordinates[i + 1];

    if (color !== currentColor) {
      if (currentColor !== null && currentSegmentStart !== null) {
        addSegmentLength(currentColor, currentSegmentStart, coordinates[i]);
      }
      currentColor = color;
      currentSegmentStart = coordinates[i];
    }

    if (i === coordinates.length - 2) {
      addSegmentLength(currentColor, currentSegmentStart, nextCoord);
    }
  }

  // Find the longest red segment
  const redSegments = segmentLengths['#FF0000'];
  if (redSegments && redSegments.length > 0) {
    const longestRedSegment = redSegments.reduce((max, segment) => {
      return segment.length > max.length ? segment : max;
    });

    // Find the midpoint by iterating through the coordinates
    let cumulativeLength = 0;
    const totalLength = longestRedSegment.length;
    const targetLength = totalLength / 2;

    let midpoint = null;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];
      const segmentLength = turf.distance(turf.point(start), turf.point(end));

      if (cumulativeLength + segmentLength >= targetLength) {
        const remainingLength = targetLength - cumulativeLength;
        const fraction = remainingLength / segmentLength;
        midpoint = [
          start[0] + (end[0] - start[0]) * fraction,
          start[1] + (end[1] - start[1]) * fraction
        ];
        break;
      }
      cumulativeLength += segmentLength;
    }

    if (midpoint) {
      new mapboxgl.Popup({
        offset: 0,
        className: 'busyness-tooltip',
        anchor: 'left'
      })
        .setLngLat(midpoint)
        .setHTML(`<p>Very busy</p>`)
        .addTo(mapRef.current);
    }
  }
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
  const { fetchNoise311, fetchGarbage311, fetchOther311, fetchMulti311, add311Markers, add311Multiple, setPresentLayers } = helpers;

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

  // Update the present layers state
  setPresentLayers({
    noise: noise311.length > 0,
    trash: garbage311.length > 0,
    multipleWarnings: multi311.length > 0,
    other: other311.length > 0,
  });

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
