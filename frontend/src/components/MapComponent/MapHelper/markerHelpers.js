import mapboxgl from 'mapbox-gl';
import $ from 'jquery';

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


export function plotRoutePOI(mapRef, geojsonData, bounds) {
  const isWithinBounds = (lngLat, bounds) => {
    const [lng, lat] = lngLat;
    return lng >= bounds.getWest() && lng <= bounds.getEast() && lat >= bounds.getSouth() && lat <= bounds.getNorth();
  };

  const filteredFeatures = geojsonData.features.filter(feature => {
    const { coordinates } = feature.geometry;
    return isWithinBounds(coordinates, bounds);
  });

  const filteredGeojsonData = {
    type: 'FeatureCollection',
    features: filteredFeatures
  };

  // Add the filtered POIs as a clustered source
  addClusteredLayer(mapRef, filteredGeojsonData, 'route-pois', 'poi-marker');
}


export function addClusteredLayer (mapRef, geoJsonData, sourceId, imageId) {
  mapRef.current.addSource(sourceId, {
    type: 'geojson',
    data: geoJsonData,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 50
  });

  // Clusters are displayed using circles
  mapRef.current.addLayer({
    id: `${sourceId}-clusters`,
    type: 'circle',
    source: sourceId,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        100,
        '#f1f075',
        750,
        '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        100,
        30,
        750,
        40
      ]
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
    }
  });

  mapRef.current.on('click', `${sourceId}-unclustered-point`, e => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name } = e.features[0].properties;

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(name)
      .addTo(mapRef.current);
  });

  mapRef.current.on('click', `${sourceId}-clusters`, e => {
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

  mapRef.current.on('mouseenter', `${sourceId}-unclustered-point`, () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });
  mapRef.current.on('mouseleave', `${sourceId}-unclustered-point`, () => {
    mapRef.current.getCanvas().style.cursor = '';
  });
};

function animateMarkers($marker) {
  $marker.css({
    top: '-50px',
    opacity: 0,
  }).animate({
    top: '0px',
    opacity: 1,
  }, 500);
}

export { animateMarkers };
