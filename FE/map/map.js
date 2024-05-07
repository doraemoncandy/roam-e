let map;
let directionsService;
let directionsRenderer;

function initMap() {
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  const center = { lat: -34.397, lng: 150.644 }; // Default location
  map = new google.maps.Map(document.getElementById("map"), {
    center: center,
    zoom: 8,
  });
  directionsRenderer.setMap(map);

  document.getElementById('go').addEventListener('click', function() {
    calculateAndDisplayRoute(directionsService, directionsRenderer);
  });
}

function calculateAndDisplayRoute(directionsService, directionsRenderer) {
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  directionsService.route(
    {
      origin: start,
      destination: end,
      travelMode: 'WALKING',
      provideRouteAlternatives: true, // muultiple routes 
      // waypoints: '
    },
    (response, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(response);
    
            // New code to display step-by-step directions
            const directionsPanel = document.getElementById('directions-panel');
            directionsPanel.innerHTML = '';
            const leg = response.routes[0].legs[0];
            console.log('routes show ',response.routes);
            for (let i = 0; i < leg.steps.length; i++) {
              directionsPanel.innerHTML += '<b>Step ' + (i + 1) + ':</b> ';
              directionsPanel.innerHTML += leg.steps[i].instructions + '<br>';
            }
          } else {
            window.alert("Directions request failed due to " + status);
          }
    }
  );
}