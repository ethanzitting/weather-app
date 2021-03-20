/* eslint-disable prefer-const */
/* eslint-disable semi */

// Table of Contents
//   - Imports
//   - Table of Contents
//   - Utility Functions
//   - Global Variables and Cookies
//   - Build API calls and Event Listeners
//   - First Load sets page theme, units, and forecast based on cookies.


/* Utility Functions */

// Standard element finder utility function
let $ = element => document.querySelector(element);

// Capitalizes the first letter of words in the input string
let capitalize = (inputString) => {
  const words = inputString.split(' ');
  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1)
  }
  return words.join(' ');
}

// Gets a specific cookie from the browser storage and returns it's value alone as a string.
function getCookie (cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return ''
}

// Creates or overrides a cookie based on your provided inputs.
function setCookie (cname, cvalue) {
  let d = new Date();
  d.setTime(d.getTime() + (600 * 24 * 60 * 60 * 1000));
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

// Uses getCoookie and setCookie to check for a cookie's value, and create it if there's not one.
const ensureCookie = (cname, cvalue) => {
  let outputValue;
  if (getCookie(cname) !== '') {
    outputValue = getCookie(cname);
  } else {
    outputValue = cvalue;
    setCookie(cname, cvalue);
  }
  return outputValue;
}

// Function to convert K to C
const toCel = numberInput => Math.round(numberInput - 273.15)

// Function to convert K to F
const toFah = numberInput => Math.round((numberInput - 273.15) * 9 / 5 + 32)

/* Global Variables and Cookies */
let cityData = {};
let cityForecast = { days: [{}, {}, {}, {}, {}, {}, {}] };

// Check if cookies exist for these three vars, adding defauts if not.
let userUnit = ensureCookie('userUnit', 'fahrenheit');
let theme = ensureCookie('theme', 'light');
let recentCity = ensureCookie('recentCity', 'Colorado Springs');

// Function to Change Theme of Webpage
let setTheme = (newTheme) => {
  // Update cookie and global variable to match new theme
  theme = newTheme;
  setCookie('theme', newTheme);

  // Change Text Content and Active Status of Menu Buttons Related to Theme
  $('#theme-display').textContent = capitalize(newTheme);
  if (newTheme === 'light') {
    $('#light-button').classList.add('active')
    $('#dark-button').classList.remove('active')
  } else {
    $('#dark-button').classList.add('active')
    $('#light-button').classList.remove('active')
  }

  // Change page backgrounds and font colors to match new theme. Defaults to Light Theme
  if (newTheme === 'light') {
    // Change navbar
    $('nav').classList.remove('navbar-dark', 'bg-dark');
    $('nav').classList.add('navbar-light', 'bg-light');

    // Change body and input fields
    $('body').classList.remove('dark-theme');
    $('#location').classList.remove('dark-theme');
    $('.unit-menu').classList.remove('dt-bs');
    $('.theme-menu').classList.remove('dt-bs');
  } else {
    // Change navbar
    $('nav').classList.remove('navbar-light', 'bg-light');
    $('nav').classList.add('navbar-dark', 'bg-dark');

    // change body and input fields
    $('body').classList.add('dark-theme');
    $('#location').classList.add('dark-theme');
    $('.unit-menu').classList.add('dt-bs');
    $('.theme-menu').classList.add('dt-bs');
  }
}

// Make clicking submit search for the city in the input cell.
$('#forecastSubmit').addEventListener('click', async function () {
  const cityName = $('#location').value

  // If there is a city name in the input field onclick...
  if (cityName) {
    // Variable to tell if the API call succeeded
    let apiSuccess = false;

    // Ask the API for updated city weather data
    try {
      // Update the data in cityData and cityForecast
      cityData = await getCityInfoFromCityName(cityName);
      cityForecast = await getForecast(cityData.lat, cityData.lon);
      apiSuccess = true;
    } catch {
      // Error in getForecast();
      apiSuccess = false;
      console.log('Failed to getForecast();');
    }

    // If the API call was successful...
    if (apiSuccess) {
      // Update the recentCity cookie and global variable
      setCookie('recentCity', cityName);
      recentCity = cityName;

      // Print to DOM
      presentForecast(cityData, cityForecast)
    } else {
      console.log('failure');
    }
  }

  // Reset input field.
  $('#location').value = '';
})

let setPageUnits = async (newUnit) => {
  // Update unit button on menu
  $('#unitDisplay').textContent = capitalize(newUnit);

  // Update globar var and cookie
  userUnit = newUnit;
  setCookie('userUnit', newUnit);

  if (newUnit === "celsius") {
    // Update active menu unit button
    $('#celBtn').classList.add('active');
    $('#fahBtn').classList.remove('active');
  } else {
    // Update active menu unit button
    $('#fahBtn').classList.add('active');
    $('#celBtn').classList.remove('active');
  }
}

// Make changing units in menu convert data to correct units to DOM
$('#fahBtn').addEventListener('click', async () => {
  setPageUnits('fahrenheit');
  // If the user has weather data already present in the program...
  if (cityForecast) {
    // Convert it to the userUnit
    convertTemps(cityForecast);

    // And then print it to DOM
    presentForecast(cityData, cityForecast);
  }
});

$('#celBtn').addEventListener('click', async () => {
  setPageUnits('celsius');
  // If the user has weather data already present in the program...
  if (cityForecast) {
    // Convert it to the userUnit
    convertTemps(cityForecast);

    // And then print it to DOM
    presentForecast(cityData, cityForecast);
  }
});

$('#light-button').addEventListener('click', () => setTheme('light'))

$('#dark-button').addEventListener('click', () => setTheme('dark'))

// Hotfix to fix broken bootstrap hamburger bar
$('.navbar-toggler').addEventListener('click', () => $('.collapse').classList.toggle('show'));

// Accesses user cookies to change unit on page to their preferred units.
function convertTemps (forecastData) {
  // If user has Celsius selected, convert temps from K to C, otherwise convert to F
  if (getCookie('userUnit') === 'celsius') {
    forecastData.currentTemp = toCel(forecastData.currentTempK);
    for (let i = 0; i < forecastData.days.length; i++) {
      forecastData.days[i].max = toCel(forecastData.days[i].maxK);
      forecastData.days[i].min = toCel(forecastData.days[i].minK);
    }
  } else {
    forecastData.currentTemp = toFah(forecastData.currentTempK);
    for (let i = 0; i < forecastData.days.length; i++) {
      forecastData.days[i].max = toFah(forecastData.days[i].maxK);
      forecastData.days[i].min = toFah(forecastData.days[i].minK);
    }
  }
}

// Takes retrieved weather data object and displays it in the DOM
function presentForecast (cityData, weatherData) {
  // Convert the temps to the user's chosen unit
  convertTemps(cityForecast);

  console.log('Inside presentForecast():');
  console.log(cityData);
  console.log(cityForecast);

  // Clear away the old week forecast data
  $('.week-display').innerHTML = '';
  const shortUnit = userUnit[0].toUpperCase();

  // Print all the new weather data to the DOM
  $('.current-display').innerHTML = `<h3>${cityData.city}, ${cityData.country}</h3><br>
  <img src="https://openweathermap.org/img/wn/${weatherData.days[0].icon}@2x.png" class="current-icon" alt="current weather icon"><br>
  ${weatherData.currentTemp}${shortUnit} ${weatherData.days[0].clouds}<br>
  High: ${weatherData.days[0].max}${shortUnit}<br>Low: ${weatherData.days[0].min}${shortUnit}<br>
  `
  for (let i = 1; i < weatherData.days.length; i++) {
    $('.week-display').innerHTML += `
    <div class="card text-center" style="width: 150px">
      <img src="https://openweathermap.org/img/wn/${weatherData.days[i].icon}@2x.png" class="card-img-top week-icon" alt="weather icon"/>
      <div class="card-body">
        <h5 class="card-title">${weatherData.days[i].thisDay}</h5>
        <p class="card-subtitle">${weatherData.days[i].clouds}</p>
        <p class="card-text">High: ${weatherData.days[i].max}${shortUnit}<br>Low: ${weatherData.days[i].min}${shortUnit}</p>
      </div>
    </div>
    `
  }

  console.log('leaving presentForecast()');
}

// Takes in City String, and returns an object with lat, lon, city, state, and country names.
const getCityInfoFromCityName = async (inputCity) => {
  await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${inputCity}&key=e209b80362d0452595badd36722aa189`)
    .then(response => response.json())
    .then((response) => {
      console.log('API call made.')
      console.log(response);
      // Updat cityData global var
      cityData.lat = response.results[0].geometry.lat;
      cityData.lon = response.results[0].geometry.lng;
      if (response.results[0].components.city) {
        cityData.city = response.results[0].components.city;
      } else {
        cityData.city = response.results[0].components.place;
      }
      cityData.country = response.results[0].components.country_code.toUpperCase();
    })
    .catch(e => console.log(e))
  console.log(cityData);
  return cityData;
}

// Takes in a lat and lon and returns an object with city, state, and country names.
const getCityInfoFromCoords = async (lat, lon) => {
  await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=e209b80362d0452595badd36722aa189`)
    .then(response => response.json())
    .then((response) => {
      console.log('API call made.')
      console.log(response);
      // Update cityData global var
      cityData.lat = lat;
      cityData.lon = lon;
      cityData.city = response.results[0].components.city;
      cityData.country = response.results[0].components.country_code.toUpperCase();
    })
  return cityData;
}

// Takes in a lat and lon and returns an object with weather data there for today, and this week.
const getWeatherData = async (lat, lon) => {
  let outputObject = { days: [{}, {}, {}, {}, {}, {}, {}] };

  await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly&appid=${config.weatherAPIKey}`,
    {
      mode: 'cors'
    }
  )
    .then(response => response.json())
    .then((response) => {
      console.log('API call made.')
      // Figure out what today is and store it in a variable.
      const today = new Date()
      const day = today.getDay()
      const dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      // Store today's name and the name of the next 6 days in the response object.
      for (let i = 0; i < 7; i++) {
        let thisDay = day + i
        while (thisDay > 6) {
          thisDay -= 7
        }
        thisDay = dayList[thisDay]

        // Also process and store the weather data for today and the next 6 days.
        outputObject.days[i].thisDay = thisDay
        outputObject.days[i].icon = response.daily[i].weather[0].icon
        outputObject.days[i].clouds = capitalize(response.daily[i].weather[0].description);

        // Store numberical data in Kelvin Units
        outputObject.currentTempK = response.current.temp
        outputObject.days[i].maxK = response.daily[i].temp.max
        outputObject.days[i].minK = response.daily[i].temp.min
      }
    })
    // Error handler
    .catch((error) => {
      console.log(error)
    })

  return outputObject;
}

// Takes in a lat and lon and returns an object containing weather data
const getForecast = async (lat, lon) => { return await (getWeatherData(lat, lon)) }

$('#user-location-btn').addEventListener('click', async () => {
  if (window.navigator.geolocation) {
    window.navigator.geolocation.getCurrentPosition(async (position) => {
      let outputObject = await getForecast(position.coords.latitude, position.coords.longitude);
      console.log(outputObject);
    }, console.log('Failed to acces user location.'))
  } else {
    console.log('window.navigator.geolocation is not present in this browser.');
  }
})

// Fires once on load to build the welcome scren for the user.
const firstLoad = async () => {
  console.log('Inside firstLoad():')
  // Sets the theme on the page to light or dark
  setTheme(theme);

  // Set Units in Header to match cookie
  setPageUnits(userUnit);

  // Ask the API for the city data from cokkies
  cityData = await getCityInfoFromCityName(recentCity);

  // Ask the API for the city weather data from cookies
  cityForecast = await getForecast(cityData.lat, cityData.lon);

  // Print to DOM
  presentForecast(cityData, cityForecast)

  console.log('Leaving firstLoad()')
}

firstLoad();