mapboxgl.accessToken = 'pk.eyJ1Ijoic2hvbG93bWFrcHlkZSIsImEiOiJjbTJzNHZ2MWsxaGEzMmpzYmJxMHM3cHVmIn0.JoyvXxUYI-VtXIPDhBJmdg';
const meteoblueApiKey = '5oYZVqI4smnPXDkA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/navigation-night-v1',
    center: [3.0364, 42.8511], // Coordonnées de Port Leucate
    zoom: 9
});

const waypoints = [
    { coords: [3.0364, 42.8511], name: "Port Leucate" },
    { coords: [3.1068, 42.5188], name: "Port-Vendres" },
    { coords: [3.6119, 42.2947], name: "Golfe du Lion" },
     { coords: [3.8392, 40.0023], name: "Ciutadella de Menorca" },
    { coords: [1.9284, 37.7821], name: "Mer Méditerranée Espagnoles" },
    { coords: [-1.9932, 36.2575], name: "Mer d'Alboran" },
    { coords: [-5.3598, 36.1583], name: "Gibraltar" },
    { coords: [-5.4920, 35.9948], name: "Espagne" },
    { coords: [-6.0601, 35.9020], name: "Maroc" },
    { coords: [-6.5464, 34.9151], name: "Océan Atlantique Nord" },
    { coords: [-6.8427, 34.0381], name: "Rabat, Maroc" },
    { coords: [-10.5801, 32.9715], name: "Océan Atlantique Nord" },
    { coords: [-13.8560, 28.4891], name: "Puerto del Rosario, Espagne" },
];

let weatherPopups = [];
let currentWeatherMarker = null;

map.on('load', () => {
    // Ajouter la source de données pour le trajet
    map.addSource('route', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': waypoints.map(point => point.coords)
            }
        }
    });

    // Ajouter la couche de ligne pour le trajet
    map.addLayer({
        'id': 'route',
        'type': 'line',
        'source': 'route',
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#03a9f4',
            'line-width': 4,
            'line-dasharray': [2, 2]
        }
    });

    // Ajouter des marqueurs pour chaque point
    waypoints.forEach((point, index) => {
        const marker = new mapboxgl.Marker()
            .setLngLat(point.coords)
            .addTo(map);

        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        marker.getElement().addEventListener('mouseenter', () => {
            popup.setLngLat(point.coords)
                .setHTML(point.name)
                .addTo(map);
        });

        marker.getElement().addEventListener('mouseleave', () => {
            popup.remove();
        });

        // Ajouter un écouteur d'événements pour le clic sur les marqueurs (sauf le dernier)
        if (index < waypoints.length - 1) {
            marker.getElement().addEventListener('click', () => {
                fetchAndDisplayWeather(point);
            });
        }
    });

    // Ajuster la vue pour montrer tout le trajet
    const bounds = new mapboxgl.LngLatBounds();
    waypoints.forEach(point => bounds.extend(point.coords));
    map.fitBounds(bounds, { padding: 50 });

    // Fonction pour afficher la météo
    function showWeather() {
        console.log("Bouton Météo cliqué");
        
        if (weatherPopups.length > 0) {
            // Si des popups sont déjà affichées, les supprimer
            weatherPopups.forEach(popup => popup.remove());
            weatherPopups = [];
            if (currentWeatherMarker) {
                currentWeatherMarker.remove();
                currentWeatherMarker = null;
            }
        } else {
            // Afficher la météo uniquement pour le dernier point
            const lastPoint = waypoints[waypoints.length - 1];
            fetchAndDisplayWeather(lastPoint);
            className: 'weather-popup'
        }
    }

    function fetchAndDisplayWeather(point) {
        fetch(`https://my.meteoblue.com/packages/basic-1h?lat=${point.coords[1]}&lon=${point.coords[0]}&apikey=${meteoblueApiKey}`)
            .then(response => response.json())
            .then(data => {
                console.log("Données météo reçues pour " + point.name + ":", data);
                displayWeatherOnMap(point, data);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données météo pour " + point.name + ":", error);
                displayErrorOnMap(point, "Erreur de récupération des données météo");
            });
    }

    // Fonction pour afficher les données météo sur la carte
    function displayWeatherOnMap(point, weatherData) {
        console.log("Traitement des données météo pour", point.name, weatherData);

        if (!weatherData || !weatherData.data_1h) {
            console.error("Structure de données météo invalide pour", point.name);
            displayErrorOnMap(point, "Données météo invalides");
            return;
        }

        try {
            const currentIndex = findClosestTimeIndex(weatherData.data_1h.time);
            const currentData = {
                temperature: weatherData.data_1h.temperature[currentIndex],
                windSpeed: weatherData.data_1h.windspeed[currentIndex],
                windDirection: weatherData.data_1h.winddirection[currentIndex],
                pictocode: weatherData.data_1h.pictocode[currentIndex],
                precipitation: weatherData.data_1h.precipitation[currentIndex],
                feltTemperature: weatherData.data_1h.felttemperature[currentIndex],
                relativeHumidity: weatherData.data_1h.relativehumidity[currentIndex],
                snowFraction: weatherData.data_1h.snowfraction[currentIndex],
                time: new Date(weatherData.data_1h.time[currentIndex])
            };

            const weatherDescription = getWeatherDescription(currentData.pictocode);
            const seaCondition = currentData.windSpeed > 10 ? 'Agitée' : 'Calme';
            const windSpeedKnots = (currentData.windSpeed * 1.94384).toFixed(1);

            const popupContent = `
                <h3>${point.name}</h3>
                <p>Prévision pour : ${currentData.time.toLocaleString()}</p>
                <p>Température: ${currentData.temperature !== undefined ? currentData.temperature.toFixed(1) + '°C' : 'N/A'}</p>
                <p>Température ressentie: ${currentData.feltTemperature !== undefined ? currentData.feltTemperature.toFixed(1) + '°C' : 'N/A'}</p>
                <p>Humidité relative: ${currentData.relativeHumidity !== undefined ? currentData.relativeHumidity.toFixed(0) + '%' : 'N/A'}</p>
                <p>Vent: ${windSpeedKnots} nœuds, Direction: ${currentData.windDirection !== undefined ? currentData.windDirection + '°' : 'N/A'}</p>
                <p>Précipitations: ${currentData.precipitation !== undefined ? currentData.precipitation.toFixed(2) + ' mm' : 'N/A'}</p>
                <p>Neige: ${currentData.snowFraction !== undefined ? (currentData.snowFraction * 100).toFixed(0) + '%' : 'N/A'}</p>
                <p>État de la mer: ${seaCondition}</p>
            `;

            // Supprimer les popups existantes
            weatherPopups.forEach(popup => popup.remove());
            weatherPopups = [];

            // Créer et afficher la nouvelle popup
            const popup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(point.coords)
                .setHTML(popupContent)
                .addTo(map);

            weatherPopups.push(popup);
        } catch (error) {
            console.error("Erreur lors du traitement des données météo pour", point.name, error);
            displayErrorOnMap(point, "Erreur de traitement des données météo");
        }
    }

    function displayErrorOnMap(point, errorMessage) {
        const popupContent = `
            <h3>${point.name}</h3>
            <p>${errorMessage}</p>
        `;

        new mapboxgl.Popup({ closeOnClick: false })
            .setLngLat(point.coords)
            .setHTML(popupContent)
            .addTo(map);
    }

    function findClosestTimeIndex(timeArray) {
        const now = new Date();
        let closestIndex = 0;
        let smallestDifference = Infinity;

        timeArray.forEach((timeString, index) => {
            const time = new Date(timeString);
            const difference = Math.abs(time - now);
            if (difference < smallestDifference) {
                smallestDifference = difference;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    function getWeatherDescription(pictocode) {
        const weatherCodes = {
            1: "Ensoleillé", 2: "Peu nuageux", 3: "Partiellement nuageux", 4: "Nuageux",
            5: "Très nuageux", 6: "Couvert", 7: "Brouillard", 8: "Averses",
            9: "Fortes averses", 10: "Pluie", 11: "Fortes pluies", 12: "Pluie verglaçante",
            13: "Neige", 14: "Fortes chutes de neige", 15: "Grêle", 16: "Orage",
            17: "Fortes averses orageuses", 18: "Pluie et neige mêlées",
            19: "Forte pluie et neige mêlées", 20: "Brouillard givrant",
            22: "Neige légère", 27: "Orage avec pluie", 28: "Averses orageuses",
            31: "Pluie légère", 33: "Pluie modérée"
        };
        return weatherCodes[pictocode] || `Indéterminé (code: ${pictocode})`;
    }

    // Fonction pour afficher l'itinéraire
    function showRoute() {
        console.log("showRoute appelé");
        if (typeof window.toggleItinerary === 'function') {
            console.log("Appel de toggleItinerary");
            window.toggleItinerary(map);
        } else {
            console.error("La fonction toggleItinerary n'est pas définie ou accessible");
        }
    }

    let itineraryPopup = null;

    function toggleItinerary() {
        if (itineraryPopup) {
            itineraryPopup.remove();
            itineraryPopup = null;
        } else {
            let itineraryHTML = "<h3>Itinéraire du circuit de bateau</h3><ol>";
            for (let i = 0; i < waypoints.length - 1; i++) {
                itineraryHTML += `<li>${waypoints[i].name} > ${waypoints[i+1].name}</li>`;
            }
            itineraryHTML += "</ol>";

            itineraryPopup = new mapboxgl.Popup({
            closeOnClick: false,
            anchor: 'center', // Center the popup
            offset: 0 // Remove the arrow by setting offset to 0
        })
            .setLngLat(map.getCenter())
            .setHTML(itineraryHTML)
            .addTo(map);
        }
    }

    let positionPopup = null;

    // Fonction pour ouvrir la page MarineTraffic
    function showPosition() {
        const url = "https://www.marinetraffic.com/en/ais/home/shipid:9162513/zoom:13";
        window.open(url, '_blank');
    }

    // Ajout des écouteurs d'événements pour les boutons
    document.getElementById('weatherBtn').addEventListener('click', showWeather);
    document.getElementById('routeBtn').addEventListener('click', () => {
        console.log("Bouton d'itinéraire cliqué");
        toggleItinerary(map);
    document.getElementById('positionBtn').addEventListener('click', showPosition);

    });
});

// CODE IMAGES JM 

// Fonction pour créer un marqueur avec une image miniature
function createImageMarker(coords, imageName) {
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = `url('https://raw.githubusercontent.com/FDK31/CLIPPERTON/refs/heads/main/WebClipperton/js/img/${imageName}')`;
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.backgroundSize = 'cover';
    el.style.cursor = 'pointer';

    el.addEventListener('click', () => {
        openImageModal(imageName);
    });

    return new mapboxgl.Marker(el)
        .setLngLat(coords)
        .addTo(map);
}

// Fonction pour ouvrir une modal avec l'image agrandie
function openImageModal(imageName) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    const img = document.createElement('img');
    img.src = `https://raw.githubusercontent.com/FDK31/CLIPPERTON/refs/heads/main/WebClipperton/js/img/${imageName}`;
    img.style.maxWidth = '90%';
    img.style.maxHeight = '90%';
    img.style.objectFit = 'contain';

    modal.appendChild(img);
    document.body.appendChild(modal);

    modal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Ajouter les marqueurs d'images pour chaque point
waypoints.forEach((point, index) => {
    // Assurez-vous d'avoir une image correspondante pour chaque point
    const imageName = `image_${index + 1}.jpg`; // Ajustez le nom de fichier selon vos besoins
    createImageMarker(point.coords, imageName);
});