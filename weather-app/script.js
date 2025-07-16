        // API configuration
        const API_KEY = 'fa874d2319bfe0a6f88d7e6d1724b07d';
        const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
        
        // DOM elements
        const locationInput = document.getElementById('location-input');
        const searchBtn = document.getElementById('search-btn');
        const voiceSearchBtn = document.getElementById('voice-search');
        const cityName = document.getElementById('city-name');
        const currentDate = document.getElementById('current-date');
        const weatherIcon = document.getElementById('weather-icon');
        const weatherDescription = document.getElementById('weather-description');
        const temperature = document.getElementById('temperature');
        const windSpeed = document.getElementById('wind-speed');
        const windDirection = document.getElementById('wind-direction');
        const humidity = document.getElementById('humidity');
        const pressure = document.getElementById('pressure');
        const visibility = document.getElementById('visibility');
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        const loading = document.querySelector('.loading');
        const themeToggle = document.getElementById('theme-toggle');
        const favoritesContainer = document.getElementById('favorites-container');
        const langOptions = document.querySelectorAll('.lang-option');
        const mapElement = document.getElementById('map');
        const backToTopButton = document.getElementById('back-to-top');
        
        // Language translations
        const translations = {
            en: {
                searchPlaceholder: "Enter a city name or use voice search",
                searchBtn: "Search",
                favorites: "Favorites",
                mapTitle: "Location Map",
                forecastTitle: "5-Day Forecast",
                calendarText: "Select Date",
                alertsTitle: "Weather Alerts",
                windSpeed: "Wind Speed",
                humidity: "Humidity",
                pressure: "Pressure",
                visibility: "Visibility",
                today: "Today",
                heatAlert: "Heat Advisory",
                heatMessage: "A heat advisory is in effect until 8 PM. High temperatures expected. Stay hydrated and avoid prolonged sun exposure.",
                windAlert: "Wind Advisory",
                windMessage: "Wind gusts up to 40 mph expected this afternoon. Secure outdoor objects and use caution when driving.",
                cityNotFound: "City not found. Please try again."
            },
            es: {
                searchPlaceholder: "Ingresa una ciudad o usa búsqueda por voz",
                searchBtn: "Buscar",
                favorites: "Favoritos",
                mapTitle: "Mapa de Ubicación",
                forecastTitle: "Pronóstico de 5 Días",
                calendarText: "Seleccionar Fecha",
                alertsTitle: "Alertas del Tiempo",
                windSpeed: "Velocidad del Viento",
                humidity: "Humedad",
                pressure: "Presión",
                visibility: "Visibilidad",
                today: "Hoy",
                heatAlert: "Advertencia de Calor",
                heatMessage: "Una advertencia de calor está vigente hasta las 8 PM. Se esperan altas temperaturas. Manténgase hidratado y evite la exposición prolongada al sol.",
                windAlert: "Advertencia de Viento",
                windMessage: "Se esperan ráfagas de viento de hasta 65 km/h esta tarde. Asegure los objetos al aire libre y tenga precaución al conducir.",
                cityNotFound: "Ciudad no encontrada. Por favor intente nuevamente."
            }
        };
        
        // Current language
        let currentLang = 'en';
        
        // Initialize map (always uses light theme)
        let map = L.map('map').setView([51.505, -0.09], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            // Set current date
            updateDate();
            
            // Set up event listeners
            searchBtn.addEventListener('click', searchWeather);
            locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') searchWeather();
            });
            
            voiceSearchBtn.addEventListener('click', startVoiceRecognition);
            themeToggle.addEventListener('click', toggleTheme);
            
            // Language selection
            langOptions.forEach(option => {
                option.addEventListener('click', () => {
                    langOptions.forEach(opt => opt.classList.remove('active'));
                    option.classList.add('active');
                    currentLang = option.dataset.lang;
                    updateLanguage();
                });
            });
            
            // Add event listeners to favorite cities
            document.querySelectorAll('.favorite-city').forEach(city => {
                city.addEventListener('click', () => {
                    getWeatherData(city.dataset.city);
                });
            });
            
            // Add event listeners to calendar days
            document.querySelectorAll('.calendar-day').forEach(day => {
                day.addEventListener('click', () => {
                    document.querySelectorAll('.calendar-day').forEach(d => {
                        d.classList.remove('active');
                    });
                    day.classList.add('active');
                });
            });
            
            // Back to top button
            backToTopButton.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
            
            // Scroll event listener for back to top button
            window.addEventListener('scroll', () => {
                // Show button when scrolled to bottom
                const scrollPosition = window.scrollY;
                const windowHeight = window.innerHeight;
                const documentHeight = document.body.scrollHeight;
                
                if (windowHeight + scrollPosition >= documentHeight - 100) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            });
            
            // Get user's current location
            getCurrentLocation();
        });
        
        // Update UI with current language
        function updateLanguage() {
            const lang = translations[currentLang];
            
            // Update text elements
            locationInput.placeholder = lang.searchPlaceholder;
            document.getElementById('search-text').textContent = lang.searchBtn;
            document.getElementById('favorites-text').textContent = lang.favorites;
            document.getElementById('map-title').textContent = lang.mapTitle;
            document.getElementById('forecast-title').textContent = lang.forecastTitle;
            document.getElementById('calendar-text').textContent = lang.calendarText;
            document.getElementById('alerts-title').textContent = lang.alertsTitle;
            document.getElementById('today-text').textContent = lang.today;
            document.getElementById('heat-alert').textContent = lang.heatAlert;
            document.getElementById('heat-message').textContent = lang.heatMessage;
            document.getElementById('wind-alert').textContent = lang.windAlert;
            document.getElementById('wind-message').textContent = lang.windMessage;
            
            // Update weather labels
            document.getElementById('wind-label').textContent = lang.windSpeed;
            document.getElementById('humidity-label').textContent = lang.humidity;
            document.getElementById('pressure-label').textContent = lang.pressure;
            document.getElementById('visibility-label').textContent = lang.visibility;
        }
        
        // Get user's current location
        function getCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const { latitude, longitude } = position.coords;
                        getWeatherByCoords(latitude, longitude);
                    },
                    error => {
                        console.error('Error getting location:', error);
                        // Default to New York if location access is denied
                        getWeatherData('New York');
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
                getWeatherData('New York');
            }
        }
        
        // Search weather by location
        function searchWeather() {
            const location = locationInput.value.trim();
            if (location) {
                getWeatherData(location);
            } else {
                showError(translations[currentLang].cityNotFound);
            }
        }
        
        // Get weather data from API
        async function getWeatherData(location) {
            try {
                showLoading(true);
                hideError();
                
                // Encode the location for URL
                const encodedLocation = encodeURIComponent(location);
                const url = `${BASE_URL}?q=${encodedLocation}&appid=${API_KEY}&units=metric`;
                
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch weather data');
                }
                
                const data = await response.json();
                displayWeatherData(data);
                
                // Update map
                updateMap(data.coord.lat, data.coord.lon);
            } catch (error) {
                console.error('Error fetching weather data:', error);
                
                // Handle common errors
                if (error.message.includes('404')) {
                    showError(translations[currentLang].cityNotFound);
                } else if (error.message.includes('401')) {
                    showError('Invalid API key. Please check your API configuration.');
                } else {
                    showError(`Error: ${error.message}`);
                }
            } finally {
                showLoading(false);
            }
        }
        
        // Get weather by coordinates
        async function getWeatherByCoords(lat, lon) {
            try {
                showLoading(true);
                hideError();
                
                const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch weather data by coordinates');
                }
                
                const data = await response.json();
                displayWeatherData(data);
                
                // Update map
                updateMap(lat, lon);
            } catch (error) {
                console.error('Error:', error);
                showError('Could not get weather for your location. Using default location.');
                getWeatherData('New York');
            } finally {
                showLoading(false);
            }
        }
        
        // Display weather data
        function displayWeatherData(data) {
            cityName.textContent = `${data.name}, ${data.sys.country}`;
            temperature.textContent = Math.round(data.main.temp);
            weatherDescription.textContent = data.weather[0].description;
            
            // Set weather icon
            const iconCode = data.weather[0].icon;
            const iconClass = getWeatherIcon(iconCode);
            weatherIcon.className = `fas ${iconClass}`;
            
            // Set weather details
            windSpeed.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
            humidity.textContent = `${data.main.humidity}%`;
            pressure.textContent = `${data.main.pressure} hPa`;
            visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
            
            // Set wind direction
            if (data.wind.deg) {
                windDirection.style.transform = `rotate(${data.wind.deg}deg)`;
            }
            
            // Update input field
            locationInput.value = data.name;
        }
        
        // Get appropriate weather icon
        function getWeatherIcon(iconCode) {
            const iconMap = {
                '01d': 'fa-sun',
                '01n': 'fa-moon',
                '02d': 'fa-cloud-sun',
                '02n': 'fa-cloud-moon',
                '03d': 'fa-cloud',
                '03n': 'fa-cloud',
                '04d': 'fa-cloud',
                '04n': 'fa-cloud',
                '09d': 'fa-cloud-rain',
                '09n': 'fa-cloud-rain',
                '10d': 'fa-cloud-sun-rain',
                '10n': 'fa-cloud-moon-rain',
                '11d': 'fa-bolt',
                '11n': 'fa-bolt',
                '13d': 'fa-snowflake',
                '13n': 'fa-snowflake',
                '50d': 'fa-smog',
                '50n': 'fa-smog'
            };
            
            return iconMap[iconCode] || 'fa-cloud';
        }
        
        // Update map with new location
        function updateMap(lat, lon) {
            map.setView([lat, lon], 12);
            // Clear existing markers
            map.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });
            
            L.marker([lat, lon]).addTo(map)
                .bindPopup(`<b>${cityName.textContent}</b><br>Current weather location`)
                .openPopup();
        }
        
        // Update current date
        function updateDate() {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            currentDate.textContent = now.toLocaleDateString(currentLang, options);
        }
        
        // Show loading spinner
        function showLoading(isLoading) {
            loading.style.display = isLoading ? 'flex' : 'none';
        }
        
        // Show error message
        function showError(message) {
            errorText.textContent = message;
            errorMessage.style.display = 'block';
        }
        
        // Hide error message
        function hideError() {
            errorMessage.style.display = 'none';
        }
        
        // Toggle dark/light mode
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            // Map remains in light theme regardless of dark mode
        }
        
        // Start voice recognition
        function startVoiceRecognition() {
            // Add visual feedback
            voiceSearchBtn.classList.add('voice-listening');
            
            // In a real app, this would use the Web Speech API
            // For this demo, we'll simulate voice recognition
            setTimeout(() => {
                voiceSearchBtn.classList.remove('voice-listening');
                
                // Simulate recognizing "London"
                locationInput.value = 'London';
                getWeatherData('London');
            }, 2000);
        }
        
        // Initialize with default data
        function initializeApp() {
            // This would be replaced with actual API calls
            updateDate();
            
            // Simulate loading current location
            setTimeout(() => {
                getWeatherData('New York');
            }, 1000);
        }
        
        // Start the app
        initializeApp();