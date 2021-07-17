var markeColors = ["#a3f600","#dcf400","#f7db11","#fdb72a","#fca35d","#ff5f65"];

function createMap(earthQuakes) {

    // Create the tile layer that will be the background of our map
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
    });
  
    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
      "Light Map": lightmap
    };
  
    // Create an overlayMaps object to hold the bikeStations layer
    var overlayMaps = {
      "Earthquakes": earthQuakes
    };
  
    // Create the map object with options
    var map = L.map("mapid", {
      center: [35, -110],
      zoom: 6,
      layers: [lightmap, earthQuakes]
    });
  
    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(map);

    // Create a legend to display information about our map
    var info = L.control({
      position: "bottomright"
    });

    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function() {
      var div = L.DomUtil.create("div", "legend");
      var limits = ["-10-10","10-30","30-50","50-70","70-90","90+"];
      var colors = markeColors;
      var labels = [];
  
      limits.forEach(function(limit, index) {
        labels.push("<li style='background-color:"+ colors[index] +"'></li><div class='max'>"+ limits[index] +" </div>");
      });
  
      div.innerHTML +='<ul>' + labels.join('') + '</ul>';
  
      return div;
    };
    // Add the info legend to the map
    info.addTo(map);

}

function markerColor(depth) {
  var index = Math.round(depth/6);
  return markeColors[index];
}
  
function createMarkers(response) {

  // Pull the "features" property off of response.features
  var features = response.features;

  // Initialize an array to hold bike markers
  var earthQuakeMarkers = [];

  // Loop through the earthquakes array
  for (var index = 0; index < features.length; index++) {
    var feature = features[index];
    var coordinates = feature.geometry.coordinates;
    var property = feature.properties;

    var earthquakeMarker = L.circleMarker([coordinates[1], coordinates[0]], {
        fillOpacity: .85,
        weight:.5,
        color: "black",
        fillColor: markerColor(coordinates[2]),
        radius: (property.mag * 5)
      }).bindPopup("<h1>" + property.title + "</h1> <hr> <h3>Time: " + new Date(property.time) + "</h3> <hr> <h3>Depth: " + coordinates[2] + "</h3>");
    
    // Add the marker to the earthQuakeMarkers array
    earthQuakeMarkers.push(earthquakeMarker);
  }

  // Create a layer group made from the earthQuakeMarkers markers array, pass it into the createMap function
  createMap(L.layerGroup(earthQuakeMarkers));
}
  
  
// Perform an API call to the Citi Bike API to get station information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(createMarkers);