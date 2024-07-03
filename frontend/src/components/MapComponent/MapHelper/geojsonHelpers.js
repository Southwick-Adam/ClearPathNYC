export function convertToGeoJSON(data) {
    return {
      type: "FeatureCollection",
      features: data.map(location => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: location.coordinates
        },
        properties: {
          name: location.name
        }
      }))
    };
  }
  