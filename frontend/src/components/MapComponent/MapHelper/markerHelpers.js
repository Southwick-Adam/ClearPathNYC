import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import PopupContent from '../../PopupContent/PopupContent';
import poijson from '../../../assets/geodata/171_POIs.json';
import useStore from '../../../store/store';
import floraImage from '../../../assets/images/flora.png';
import floraCBImage from '../../../assets/images/flora_CB.png';

export function addMarkers(mapRef, markerData, markerType) {
  markerData.forEach(location => {
    const marker = document.createElement('div');
    marker.className = `marker ${markerType}_marker`;

    new mapboxgl.Marker({
      element: marker,
      offset: [0, -10]
    })
      .setLngLat(location.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.name))
      .addTo(mapRef.current);

    animateMarkers($(marker));
  });
}

export function add311Markers(mapRef, markerData, category) {
  markerData.forEach(location => {
    const marker = document.createElement('div');
    const markerType = getMarkerType(category, location.category);
    marker.className = `marker ${markerType}_marker marker311`;

    new mapboxgl.Marker({
      element: marker,
      offset: [0, -10]
    })
      .setLngLat(location.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.Complaint_Type_collection))
      .addTo(mapRef.current);

    animateMarkers($(marker));
  });
}

function animateMarkers($marker) {
  $marker.css({
    top: '-50px',
    opacity: 0,
  }).animate({
    top: '0px',
    opacity: 1,
  }, 500);
}

// Function to add 311 multiple complaint markers
export function add311Multiple(mapRef, markerData) {
  markerData.forEach(location => {
    const marker = document.createElement('div');
    const markerType = getMultiMarkerType(location.severity);
    marker.className = `marker ${markerType}_marker`;

    new mapboxgl.Marker({
      element: marker,
      offset: [0, -10]
    })
      .setLngLat(location.coordinates)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(location.Complaint_Type_collection))
      .addTo(mapRef.current);

    animateMarkers($(marker));
  });
}

function getMarkerType(complaintCategory, severityCategory) {
  let markerType = complaintCategory.toLowerCase();

  if (severityCategory === 'Very High') {
    markerType += '_very_high';
  } else if (severityCategory === 'High') {
    markerType += '_high';
  }

  return markerType;
}

// Helper function to determine the marker type based on severity
function getMultiMarkerType(severity) {
  return severity === 'Very High' ? 'multi_very_high' : 'multi_high';
}

export function plotRoutePOI(mapRef, geojsonData, helpers) {
  // No filtering by bounds, just use all features
  const allFeaturesGeojsonData = {
    type: 'FeatureCollection',
    features: geojsonData.features
  };

  // Add all POIs as a clustered source
  addClusteredLayer(mapRef, allFeaturesGeojsonData, 'route-pois', 'poi-marker', '#00cffa');

  mapRef.current.setPaintProperty('route-pois-unclustered-point', 'icon-opacity', 1);

  let popup = null; // Declare popup variable

  const closePopup = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
  };

  const createPopup = (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name } = e.features[0].properties;

    // Remove any existing popups
    const existingPopups = document.getElementsByClassName('mapboxgl-popup');
    while (existingPopups.length > 0) {
      existingPopups[0].remove();
    }

    const popupNode = document.createElement('div');
    const root = createRoot(popupNode); // Use createRoot instead of ReactDOM.render
    root.render(
      <PopupContent
        coordinates={coordinates}
        name={name}
        setLoopCord={helpers.setLoopCord}
        setStartCord={helpers.setStartCord}
        setEndCord={helpers.setEndCord}
        setWaypointAndIncrease={helpers.setWaypointAndIncrease}
        updateLoopStartInput={helpers.updateLoopStartInput}
        updateStartInput={helpers.updateStartInput}
        updateEndInput={helpers.updateEndInput}
        updateWaypointInput={helpers.updateWaypointInput}
        geocoderRefs={helpers.geocoderRefs}
        closePopup={closePopup} // Pass closePopup function
      />
    );

    if (popup) {
      popup.remove(); // Remove existing popup
    }

    popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
      .setLngLat(coordinates)
      .setDOMContent(popupNode)
      .addTo(mapRef.current);
  };

  mapRef.current.on('mouseenter', 'route-pois-unclustered-point', (e) => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
    createPopup(e); // Create popup on hover
  });

  mapRef.current.on('mouseleave', 'route-pois-unclustered-point', () => {
    mapRef.current.getCanvas().style.cursor = '';
    if (popup && !popup.isOpen) {
      popup.remove(); // Remove popup on mouse leave if not clicked
    }
  });

  mapRef.current.on('click', 'route-pois-unclustered-point', (e) => {
    createPopup(e); // Keep popup open on click
    if (popup) {
      popup.isOpen = true; // Mark popup as open
    }
  });

  mapRef.current.on('click', 'route-pois-clusters', (e) => {
    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['route-pois-clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    mapRef.current.getSource('route-pois').getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      mapRef.current.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      });
    });
  });

  mapRef.current.on('mouseenter', 'route-pois-clusters', () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });
  mapRef.current.on('mouseleave', 'route-pois-clusters', () => {
    mapRef.current.getCanvas().style.cursor = '';
  });
}

export function addClusteredLayer(mapRef, geoJsonData, sourceId, imageId, clusterColor) {
  if (mapRef.current.getSource(sourceId)) {
    mapRef.current.removeLayer(`${sourceId}-clusters`);
    mapRef.current.removeLayer(`${sourceId}-cluster-count`);
    mapRef.current.removeLayer(`${sourceId}-unclustered-point`);
    mapRef.current.removeSource(sourceId);
  }

  mapRef.current.addSource(sourceId, {
    type: 'geojson',
    data: geoJsonData,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 80
  });

  // Clusters are displayed using circles
  mapRef.current.addLayer({
    id: `${sourceId}-clusters`,
    type: 'circle',
    source: sourceId,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': clusterColor,
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        750,
        40
      ],
      'circle-opacity': 0.6
    }
  });

  mapRef.current.addLayer({
    id: `${sourceId}-cluster-count`,
    type: 'symbol',
    source: sourceId,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#FFFFFF'
    }
  });

  // Individual points are displayed using the given marker
  mapRef.current.addLayer({
    id: `${sourceId}-unclustered-point`,
    type: 'symbol',
    source: sourceId,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': imageId,
      'icon-size': 0.5
    },
    paint: {
      'icon-opacity': 0.5 // Adjust the opacity to the desired level (0 to 1)
    }
  });

  let popup = null; // Declare popup variable

  const removeExistingPopups = () => {
    const existingPopups = document.getElementsByClassName('mapboxgl-popup');
    while (existingPopups.length > 0) {
      existingPopups[0].remove();
    }
  };

  const createPopup = (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name } = e.features[0].properties;

    // Replace commas with <br> tags for line breaks
    const formattedName = name.split(',').join('<br>');

    removeExistingPopups();

    popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
      .setLngLat(coordinates)
      .setHTML(`<div class="popup-content-311">${formattedName}</div>`)
      .addTo(mapRef.current);
  };

  mapRef.current.on('mouseenter', `${sourceId}-unclustered-point`, (e) => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
    createPopup(e); // Create popup on hover
  });

  mapRef.current.on('mouseleave', `${sourceId}-unclustered-point`, () => {
    mapRef.current.getCanvas().style.cursor = '';
    if (popup) {
      popup.remove(); // Remove popup on mouse leave
    }
  });

  mapRef.current.on('click', `${sourceId}-clusters`, (e) => {
    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: [`${sourceId}-clusters`]
    });
    const clusterId = features[0].properties.cluster_id;
    mapRef.current.getSource(sourceId).getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err) return;

      mapRef.current.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      });
    });
  });

  mapRef.current.on('mouseenter', `${sourceId}-clusters`, () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });

  mapRef.current.on('mouseleave', `${sourceId}-clusters`, () => {
    mapRef.current.getCanvas().style.cursor = '';
  });
}

export function clearMapFeatures(mapRef) {
  // Function to clear features close to the route
  const sourceIds = ['route-noise-h', 'route-noise-vh', 'route-garbage-h', 'route-other-h', 'route-multi-h', 'route-multi-vh'];

  sourceIds.forEach(sourceId => {
    if (mapRef.current.getSource(sourceId)) {
      mapRef.current.removeLayer(`${sourceId}-clusters`);
      mapRef.current.removeLayer(`${sourceId}-cluster-count`);
      mapRef.current.removeLayer(`${sourceId}-unclustered-point`);
      mapRef.current.removeSource(sourceId);
    }
  });
}

export function addMapFeatures(mapRef, helpers) {
  const {
    simulateFetchParks,
    convertToGeoJSON,
    setStartCord,
    setEndCord,
    setWaypointAndIncrease,
    updateStartInput,
    updateEndInput,
    updateWaypointInput,
    geocoderRefs
  } = helpers;

  const parkData = simulateFetchParks();
  const parkGeoJson = convertToGeoJSON(parkData);
  plotRoutePOI(mapRef, poijson, helpers);

  mapRef.current.addSource('parks', {
    type: 'geojson',
    data: parkGeoJson,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 80
  });

  mapRef.current.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'parks',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#4CAF50',
        100,
        '#388E3C',
        750,
        '#2E7D32'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        750,
        40
      ],
      'circle-opacity': 0.6
    }
  });

  mapRef.current.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'parks',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
    },
    paint: {
      'text-color': '#FFFFFF'
    }
  });

  mapRef.current.addLayer({
    id: 'unclustered-point',
    type: 'symbol',
    source: 'parks',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': 'flora-marker',
      'icon-size': 0.5,
      'icon-offset': [0, -0]
    }
  });

  let popup = null; // Declare popup variable

  const closePopup = () => {
    if (popup) {
      popup.remove();
      popup = null;
    }
  };

  const createPopup = (e) => {
    // Remove any existing popups
    const existingPopups = document.getElementsByClassName('mapboxgl-popup');
    while (existingPopups.length > 0) {
      existingPopups[0].remove();
    }

    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name } = e.features[0].properties;

    const popupNode = document.createElement('div');
    const root = createRoot(popupNode); // Use createRoot instead of ReactDOM.render
    root.render(
      <PopupContent
        coordinates={coordinates}
        name={name}
        setLoopCord={helpers.setLoopCord}
        setStartCord={setStartCord}
        setEndCord={setEndCord}
        setWaypointAndIncrease={setWaypointAndIncrease}
        updateLoopStartInput={helpers.updateLoopStartInput}
        updateStartInput={updateStartInput}
        updateEndInput={updateEndInput}
        updateWaypointInput={updateWaypointInput}
        geocoderRefs={geocoderRefs}
        closePopup={closePopup} // Pass closePopup function
      />
    );

    if (popup) {
      popup.remove(); // Remove existing popup
    }

    popup = new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
      .setLngLat(coordinates)
      .setDOMContent(popupNode)
      .addTo(mapRef.current);
  };

  mapRef.current.on('mouseenter', 'unclustered-point', (e) => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
    createPopup(e); // Create popup on hover
  });

  mapRef.current.on('mouseleave', 'unclustered-point', () => {
    mapRef.current.getCanvas().style.cursor = '';
    if (popup && !popup.isOpen) {
      popup.remove(); // Remove popup on mouse leave if not clicked
    }
  });

  mapRef.current.on('click', 'unclustered-point', (e) => {
    createPopup(e); // Keep popup open on click
    if (popup) {
      popup.isOpen = true; // Mark popup as open
    }
  });

  mapRef.current.on('click', 'clusters', (e) => {
    const features = mapRef.current.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    });
    const clusterId = features[0].properties.cluster_id;
    mapRef.current.getSource('parks').getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return;

        mapRef.current.easeTo({
          center: features[0].geometry.coordinates,
          zoom
        });
      }
    );
  });

  mapRef.current.on('mouseenter', 'clusters', () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });

  mapRef.current.on('mouseleave', 'clusters', () => {
    mapRef.current.getCanvas().style.cursor = '';
  });
}

export function reloadParkFeature(mapRef) {
  const isColorBlindMode = useStore.getState().isColorBlindMode;

  const clusterColors = isColorBlindMode
    ? ['#62309C', '#4B0082', '#2E0854'] // Example colors for color-blind mode
    : ['#4CAF50', '#388E3C', '#2E7D32'];

  if (mapRef.current.getLayer('clusters')) {
    mapRef.current.setPaintProperty('clusters', 'circle-color', [
      'step',
      ['get', 'point_count'],
      clusterColors[0],
      100,
      clusterColors[1],
      750,
      clusterColors[2]
    ]);
  }

  const floraMarkerId = isColorBlindMode ? 'flora-marker-CB' : 'flora-marker';

  // Update the unclustered-point layer with the new icon image
  if (mapRef.current.getLayer('unclustered-point')) {
    mapRef.current.setLayoutProperty('unclustered-point', 'icon-image', floraMarkerId);
  }
}

export function toggleLayerVisibility(mapRef, layerVisibility) {
  const visibilityMap = {
    parks: ['clusters', 'cluster-count', 'unclustered-point'],
    poi: ['route-pois-clusters', 'route-pois-cluster-count', 'route-pois-unclustered-point'],
    noise: ['route-noise-h-clusters', 'route-noise-h-cluster-count', 'route-noise-h-unclustered-point',
            'route-noise-vh-clusters', 'route-noise-vh-cluster-count', 'route-noise-vh-unclustered-point'],
    trash: ['route-garbage-h-clusters', 'route-garbage-h-cluster-count', 'route-garbage-h-unclustered-point'],
    other: ['route-other-h-clusters', 'route-other-h-cluster-count', 'route-other-h-unclustered-point'],
    multipleWarnings: ['route-multi-h-clusters', 'route-multi-h-cluster-count', 'route-multi-h-unclustered-point',
                       'route-multi-vh-clusters', 'route-multi-vh-cluster-count', 'route-multi-vh-unclustered-point'],
  };

  Object.keys(visibilityMap).forEach((key) => {
    const layers = visibilityMap[key];
    layers.forEach((layerId) => {
      if (mapRef.current.getLayer(layerId)) {
        mapRef.current.setLayoutProperty(
          layerId,
          'visibility',
          layerVisibility[key] ? 'visible' : 'none'
        );
      }
    });
  });
}

export { animateMarkers };
