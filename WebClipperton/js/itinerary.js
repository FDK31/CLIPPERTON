// itinerary.js

let itineraryLine;
let itineraryMarkers = [];

// Définition de l'itinéraire
const itinerary = [
    { name: "Port Leucate", coords: [3.0364, 42.8511] },
    { name: "Maroc", coords: [-8, 31] },
    { name: "Îles Canaries", coords: [-15.5, 28] },
    { name: "Les Antilles", coords: [-61, 15] },
    { name: "Panama", coords: [-80, 9] },
    { name: "Iles Marquises", coords: [-139, -9] },
    { name: "Samoa", coords: [-172, -13] },
    { name: "Papouasie", coords: [145, -6] },
    { name: "Détroit de Torrès", coords: [142, -10] },
    { name: "Indonésie", coords: [115, -2] },
    { name: "Malaisie", coords: [101, 4] },
    { name: "Iles de la Réunion", coords: [55.5, -21] },
    { name: "Madagascar", coords: [47, -19] },
    { name: "Le cap des Aiguilles", coords: [20, -34] },
    { name: "Guinée", coords: [-10, 10] },
    { name: "Maroc", coords: [-8, 31] },
    { name: "Port Leucate", coords: [3.0364, 42.8511] }
];

function toggleItinerary(map) {
    if (itineraryLine) {
        // Si l'itinéraire est déjà affiché, on le supprime
        map.removeLayer('itinerary-line');
        map.removeSource('itinerary-line');
        itineraryMarkers.forEach(marker => marker.remove());
        itineraryMarkers = [];
        itineraryLine = null;
    } else {
        // Sinon, on trace l'itinéraire
        const coordinates = itinerary.map(point => point.coords);
        
        itineraryLine = {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            }
        };

        map.addSource('itinerary-line', {
            'type': 'geojson',
            'data': itineraryLine
        });

        map.addLayer({
            'id': 'itinerary-line',
            'type': 'line',
            'source': 'itinerary-line',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#FF0000',
                'line-width': 3
            }
        });

        // Ajout des marqueurs pour chaque point
        itinerary.forEach(point => {
            const marker = new mapboxgl.Marker()
                .setLngLat(point.coords)
                .setPopup(new mapboxgl.Popup().setHTML(point.name))
                .addTo(map);
            itineraryMarkers.push(marker);
        });

        // Ajuster la vue pour montrer tout l'itinéraire
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        map.fitBounds(bounds, { padding: 50 });
    }
}

// Exporter la fonction pour qu'elle soit accessible depuis map.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { toggleItinerary };
} else {
    window.toggleItinerary = toggleItinerary;
}