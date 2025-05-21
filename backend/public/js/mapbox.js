
// The script has loaded
const locations = JSON.parse(document.getElementById('map').dataset.locations);


mapboxgl.accessToken = 'pk.eyJ1Ijoiam9obnYxMSIsImEiOiJjbWFla2UzczAwOHJ3MmpvaXg0bzg4M3NjIn0.odMSbQahGQWcEHhEdoZlbA';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/johnv11/cmaelee6f00ar01s72bgzasdz',
  // scrollZoom: false,
  center: [-118.113491, 34.111745],
  zoom: 7,
  // interactive: false
})
// };

const bounds = new mapboxgl.LngLatBounds();
// creates marker
locations.map(loc => {
  const el = document.createElement('div');
  el.className = 'marker';

  // adds marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map)



  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  bounds.extend(loc.coordinates);
});


map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});