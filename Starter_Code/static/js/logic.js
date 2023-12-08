// Creating the map object
let myMap = L.map("map", {
    center: [27.96044, -82.30695],
    zoom: 3
  });
  
  // Adding the tile layer
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);
  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });
  
  // Load the GeoJSON data.
let geoData = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
const TECTONIC_URL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

  let earthquakeGroup = new L.LayerGroup();
  let tectonicGroup = new L.LayerGroup();

  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  let overlays = {
    Earthquakes: earthquakeGroup,
    Tectonic: tectonicGroup
  };
  
  // Get the data with d3.
  d3.json(geoData).then(function(data) {
  
 
  function getValue(x) {
    return x > 90 ? "#F06A6A" :
          x > 70 ? "#F0A76A" :
          x > 50 ? "#F3B94C" :
          x > 30 ? "#F3DB4C" :
          x > 10 ? "#E1F34C" :
        
            "#B6F34C";
  }

 
  function style(feature) {
    return {
      "stroke": true,
          radius: feature.properties.mag * 3,
      fillColor: getValue(feature.geometry.coordinates[2]),
      color: "black",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    };
}


  L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, style(feature));
    },
    
        // Binding a popup to each layer
        onEachFeature: function(feature, layer) {
          layer.bindPopup("<strong>" + feature.properties.place + "</strong><br /><br />Magnitude: " +
            feature.properties.mag + "<br /><br />depth: " + feature.geometry.coordinates[2]);
        }
      }).addTo(earthquakeGroup);

      earthquakeGroup.addTo(myMap);

      
      let legend = L.control({ position: "bottomright" });

      legend.onAdd = function() {

          let div = L.DomUtil.create("div", "info legend");
          //labels = ["<10", "10-30", "30-50", "50-70", "70-90", "90+"];
          let grades = [-10, 10, 30, 50, 70, 90];
          let colors = ["#98ee00","#d4ee00","#eecc00","#ee9c00","#ea822c","#ea2c2c"];
      // loop through our density intervals and generate a label with a colored square for each interval
      for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + colors[i] + '">&emsp;&emsp;</i> '
              + grades[i]
              + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
      };

      legend.addTo(myMap);


});
  
// Get the data with d3.
d3.json(TECTONIC_URL).then(function(plate_data) {  
 
  let tectonicPlates = L.geoJson(plate_data, {
    style: {
      color: "blue",
      weight: 2,
      opacity: 1
    }
  });
    
  tectonicPlates.addTo(tectonicGroup);
  tectonicGroup.addTo(myMap);
});


var layersControl = L.control.layers(null, null, { collapsed: false });

// Add overlay layers to layer control
layersControl.addOverlay(earthquakeGroup, "Earthquakes");
layersControl.addOverlay(tectonicGroup, "Tectonic Plates");
layersControl.addBaseLayer(street, "Map");
layersControl.addBaseLayer(topo, "Topo Map");

// Add the layer control to the map
layersControl.addTo(myMap);