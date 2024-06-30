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
