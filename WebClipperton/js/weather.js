function showWeather() {
    const apiKey = CONFIG.meteoblueApiKey;
    
    waypoints.forEach(point => {
        fetch(`https://my.meteoblue.com/packages/basic-1h?lat=${point.coords[1]}&lon=${point.coords[0]}&apikey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                displayWeatherOnMap(point, data);
            })
            .catch(error => console.error("Erreur lors de la récupération des données météo:", error));
    });
}

function displayWeatherOnMap(point, weatherData) {
    const temp = weatherData.data_1h[0].temperature;
    const windSpeed = weatherData.data_1h[0].wind_speed;
    const windDirection = weatherData.data_1h[0].wind_direction;
    const weatherCode = weatherData.data_1h[0].weather_symbol;

    let weatherDescription;
    switch(weatherCode) {
        case 1: weatherDescription = "Clair"; break;
        case 2: weatherDescription = "Partiellement nuageux"; break;
        case 3: weatherDescription = "Nuageux"; break;
        case 4: weatherDescription = "Couvert"; break;
        default: weatherDescription = "Indéterminé";
    }

    const seaCondition = windSpeed > 10 ? 'Agitée' : 'Calme';

    const popupContent = `
        <h3>${point.name}</h3>
        <p>Température: ${temp}°C</p>
        <p>Vent: ${windSpeed} m/s</p>
        <p>Conditions: ${weatherDescription}</p>
        <p>État de la mer: ${seaCondition}</p>
    `;

    new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(point.coords)
        .setHTML(popupContent)
        .addTo(map);

    const windArrow = createWindArrow(windDirection);
    new mapboxgl.Marker(windArrow)
        .setLngLat(point.coords)
        .addTo(map);
}

function createWindArrow(direction) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.innerHTML = `<path d="M10 0 L20 20 L10 15 L0 20 Z" fill="white" transform="rotate(${direction} 10 10)"/>`;
    return svg;
}