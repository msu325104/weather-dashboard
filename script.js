const apiKey ='b0e38bc911a6b61940373af6ce9c1988'; 
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const weatherInfo = document.getElementById('weather-info');
const toggleUnitButton = document.getElementById('toggle-unit');
const loadingSpinner = document.getElementById('loading-spinner');

let isCelsius = true;

const convertToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;

const fetchWeatherData = async (city) => {
  const cachedData = localStorage.getItem(city);
  const cacheTimestamp = localStorage.getItem(`${city}_timestamp`);
  if (cachedData && cacheTimestamp && Date.now() - cacheTimestamp < 600000) {
    return JSON.parse(cachedData);
  }
  const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
  const data = await response.json();
  if (data.cod === 200) {
    localStorage.setItem(city, JSON.stringify(data));
    localStorage.setItem(`${city}_timestamp`, Date.now());
  }
  return data;
};

const displayWeatherData = (data) => {
  const { name, main, weather } = data;
  const iconUrl = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
  const temperature = isCelsius ? main.temp : convertToFahrenheit(main.temp);
  const unit = isCelsius ? '°C' : '°F';
  weatherInfo.innerHTML = `
    <h2>${name}</h2>
    <img class="weather-icon" src="${iconUrl}" alt="${weather[0].description}">
    <p>Temperature: ${temperature.toFixed(1)}${unit}</p>
    <p>Humidity: ${main.humidity}%</p>
    <p>Condition: ${weather[0].description}</p>
  `;
};

weatherForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    alert('Please enter a city name.');
    return;
  }
  loadingSpinner.classList.remove('hidden');
  weatherInfo.innerHTML = '';
  try {
    const data = await fetchWeatherData(city);
    if (data.cod === '404') {
      weatherInfo.innerHTML = `<p>City not found. Please try again.</p>`;
      return;
    }
    displayWeatherData(data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    weatherInfo.innerHTML = `<p>An error occurred. Please try again later.</p>`;
  } finally {
    loadingSpinner.classList.add('hidden');
  }
});

toggleUnitButton.addEventListener('click', () => {
  isCelsius = !isCelsius;
  toggleUnitButton.textContent = isCelsius ? 'Switch to °F' : 'Switch to °C';
  const city = cityInput.value.trim();
  if (city) {
    const cachedData = localStorage.getItem(city);
    if (cachedData) {
      displayWeatherData(JSON.parse(cachedData));
    }
  }
});
