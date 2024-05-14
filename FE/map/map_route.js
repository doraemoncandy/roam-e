function initMap() {
  const directionsService = new google.maps.DirectionsService();

  const request = {
    origin: 'Taipei Main Station',
    destination: 'Taipei 101',
    travelMode: 'WALKING'
  };

  directionsService.route(request, (result, status) => {
    if (status === 'OK') {
      const route = result.routes[0];
      console.log('route',route)
      // Display the route on the map.
    }
  });


  // rotue api 
  const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
const apiKey = 'AIzaSyDnPLCvxn3jbU2VEXkm90fsyuL05ChnDIo'; // Replace with your API key

const data = {
  origin: {
    location: {
      latLng: {
        latitude: 37.419734,
        longitude: -122.0827784
      }
    }
  },
  destination: {
    location: {
      latLng: {
        latitude: 37.417670,
        longitude: -122.079595
      }
    }
  },
  travelMode: 'WALK',
  //routingPreference: 'TRAFFIC_AWARE',
  // departureTime: '2023-10-15T15:01:23.045123456Z',
  // computeAlternativeRoutes: true,
  // routeModifiers: {
  //   avoidTolls: false,
  //   avoidHighways: false,
  //   avoidFerries: false
  // },
  languageCode: 'zh-TW',
  // units: 'IMPERIAL'
};

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
  },
  body: JSON.stringify(data)
};

fetch(url, options)
  .then(response => response.json())
  .then(data => console.log('route API',data))
  .catch(error => console.error('Error:', error));
}