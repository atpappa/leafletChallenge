// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Get request to the query URL
d3.json(queryUrl, function(data) {
    // Once response is received, send data.features object to the createFeatures function
    createFeatures(data.features);
    console.log(data.features[100].geometry.coordinates[2])
});

// createFeatures function to create popup and circles
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function onEachFeature(feature, layer) {
            layer.bindPopup("<h3>Location: " + feature.properties.place + "<h3>Magnitude: " + feature.properties.mag + "</h3>" +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        },
        pointToLayer: function (feature, coord) {
            return new L.circle(coord, {
                radius: findRadius(feature.properties.mag),
                fillColor: findColor(feature.geometry.coordinates[2]),
                fillOpacity: .5,
                color: "white",
                stroke: true,
                weight: .8
            })
        }
    });

    // Send earthquake layer to createMap function
    createMap(earthquakes);
}    

    // define color function
    function findColor(depth) {
        if (depth < 20) {
          return 'pink'
        } else if (depth < 40) {
          return 'tomato'
        } else if (depth > 39) {
          return 'darkred'
        };
    };

    // define radius function
    function findRadius(magnitude) {
        return magnitude * 20000;
    };

function createMap(earthquakes) {
    // Define streetmap
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 10,
        id: "light-v10",
        accessToken: API_KEY
    });

    // Basemaps object to hold base layer
    var baseMap = {
        "Light Map": lightmap
    };

    // Overlay object to hold overlay layer
    var overlayMap = {
        Earthquakes: earthquakes
    };

    // Create map, give it streetmap and earthquake layers to display on load
    var myMap = L.map("mapid", {
        center: [37.09, -105.71],
        zoom: 2,
        layers: [lightmap, earthquakes]
    });

    // Layer control
    L.control.layers(baseMap, overlayMap, {
        collapsed: false
    }).addTo(myMap);

    // LEGEND
    var legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");

        // Adding min and max
        var legendInfo = 
        '<div style="background:pink"><h1>< 20</h1></div>\
        <div style="background:tomato"><h1>< 40</h1></div>\
        <div style="background:darkred"><h1>> 40</h1></div>'

        div.innerHTML = legendInfo;

        return div;
    };

    // Add legend
    legend.addTo(myMap);
}