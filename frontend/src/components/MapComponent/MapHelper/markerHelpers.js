import mapboxgl from 'mapbox-gl';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import PopupContent from '../../PopupContent/PopupContent';
import poijson from '../../../assets/geodata/171_POIs.json'



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

    animateMarkers($(marker));}
  );
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

  // Add custom popup content for unclustered points
  mapRef.current.on('click', 'route-pois-unclustered-point', e => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name } = e.features[0].properties;

    // Remove any existing popups
    const existingPopups = document.getElementsByClassName('mapboxgl-popup');
    while (existingPopups.length > 0) {
      existingPopups[0].remove();
    }

    const popupNode = document.createElement('div');
    ReactDOM.render(
      <PopupContent
        coordinates={coordinates}
        name={name}
        setStartCord={helpers.setStartCord}
        setEndCord={helpers.setEndCord}
        setWaypointAndIncrease={helpers.setWaypointAndIncrease}
        updateStartInput={helpers.updateStartInput}
        updateEndInput={helpers.updateEndInput}
        updateWaypointInput={helpers.updateWaypointInput}
        geocoderRefs={helpers.geocoderRefs}
      />,
      popupNode
    );

    new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
      .setLngLat(coordinates)
      .setDOMContent(popupNode)
      .addTo(mapRef.current);
  });

  mapRef.current.on('mouseenter', 'route-pois-clusters', () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });
  mapRef.current.on('mouseleave', 'route-pois-clusters', () => {
    mapRef.current.getCanvas().style.cursor = '';
  });

  mapRef.current.on('mouseenter', 'route-pois-unclustered-point', () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });
  mapRef.current.on('mouseleave', 'route-pois-unclustered-point', () => {
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
}


export function clearMapFeatures(mapRef) {
  // Function to ckear features close to the route
  const sourceIds = ['route-noise-h','route-noise-vh','route-garbage-h','route-other-h','route-multi-h','route-multi-vh']; 

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
    fetchInitialPOI,
    simulateFetchParks,
    convertToGeoJSON,
    floraImage,
    noiseHighImage,
    noiseVeryHighImage,
    garbageHighImage,
    otherHighImage,
    multiHighImage,
    multiVeryHighImage,
    poiImage,
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


  mapRef.current.loadImage(floraImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('flora-marker', image);
  });

  mapRef.current.loadImage(noiseHighImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('noise-high-marker', image);
  });

  mapRef.current.loadImage(noiseVeryHighImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('noise-veryhigh-marker', image);
  });

  mapRef.current.loadImage(garbageHighImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('garbage-high-marker', image);
  });

  mapRef.current.loadImage(otherHighImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('other-high-marker', image);
  });

  mapRef.current.loadImage(multiHighImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('multi-high-marker', image);
  });

  mapRef.current.loadImage(multiVeryHighImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('multi-veryhigh-marker', image);
  });

  mapRef.current.loadImage(poiImage, (error, image) => {
    if (error) throw error;
    mapRef.current.addImage('poi-marker', image);
  });

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

  mapRef.current.on('click', 'unclustered-point', e => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const { name } = e.features[0].properties;

    const popupNode = document.createElement('div');
    ReactDOM.render(
      <PopupContent
        coordinates={coordinates}
        name={name}
        setStartCord={setStartCord}
        setEndCord={setEndCord}
        setWaypointAndIncrease={setWaypointAndIncrease}
        updateStartInput={updateStartInput}
        updateEndInput={updateEndInput}
        updateWaypointInput={updateWaypointInput}
        geocoderRefs={geocoderRefs}
      />,
      popupNode
    );

    new mapboxgl.Popup({ offset: 25, className: 'custom-popup' })
      .setLngLat(coordinates)
      .setDOMContent(popupNode)
      .addTo(mapRef.current);
  });

  mapRef.current.on('mouseenter', 'clusters', () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });
  mapRef.current.on('mouseleave', 'clusters', () => {
    mapRef.current.getCanvas().style.cursor = '';
  });

  mapRef.current.on('mouseenter', 'unclustered-point', () => {
    mapRef.current.getCanvas().style.cursor = 'pointer';
  });
  mapRef.current.on('mouseleave', 'unclustered-point', () => {
    mapRef.current.getCanvas().style.cursor = '';
  });

  mapRef.current.on('click', 'clusters', e => {
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
}

export { animateMarkers };
