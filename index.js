/* eslint-disable prefer-const */
/* eslint-disable semi */

// Gets a specific cookie from the browser storage and returns it's value alone as a string.
function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      console.log(`Cookie Found.`);
      return c.substring(name.length, c.length);
    }
  }
  console.log('Cookie Not Found.');
  return ''
}

// Creates or overrides a cookie based on your provided inputs.
function setCookie(cname, cvalue) {
  let d = new Date();
  d.setTime(d.getTime() + (600 * 24 * 60 * 60 * 1000));
  let expires = 'expires='+d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
  console.log('Cookie Set.');
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

// Check if cookies exist for these three vars, adding defauts if not.
let userUnit = ensureCookie('userUnit', 'F');
let theme = ensureCookie('theme', 'light');
let recentCity = ensureCookie('recentCity', 'Colorado Springs');

// change classes according to default theme

// Global scope object for weather data.
let cityForecast = false;

// Get the button element
const forecastSubmit = document.querySelector('#forecastSubmit')

// Function to convert K to C
const toCel = (numberInput) => {
  return Math.round(numberInput - 273.15)
}

// Function to convert K to F
const toFah = (numberInput) => {
  return Math.round(numberInput - 273.15) * 9 / 5 + 32
}

// Make clicking submit search for the city in the input cell.
forecastSubmit.addEventListener('click', async function () {
  const cityName = document.querySelector('#location').value

  if (cityName) {
    let apiSuccess = false;
    // Ask the API for the city weather data
    try {
      cityForecast = await getForecast(cityName);
      apiSuccess = true;
    } catch {
      apiSuccess = false;
      console.log('Failed to getForecast();');
    }

    if (apiSuccess) {
      console.log(cityForecast);
      // Update the recentCity cookie and variable
      setCookie('recentCity', cityName);
      recentCity = cityName;

      // Convert the temps to the user's chosen unit
      convertTemps();

      // Print to DOM
      await presentForecast(cityForecast)
    } else {
      console.log('failure');
    }
  }

  // Reset input field.
  document.querySelector('#location').value = '';
})

// Load the default city weather data.
const firstLoad = async () => {
  // Set Units in Header
  if (userUnit === 'F') {
    document.querySelector('#unitDisplay').textContent = 'Fahrenheit';
  } else if (userUnit === 'C') {
    document.querySelector('#unitDisplay').textContent = 'Celsius';
  } else {
    console.log('Error access userUnit in FirstLoad();');
  }

  // Ask the API for the city weather data
  cityForecast = await getForecast(recentCity);

  // Convert the temps to the user's chosen unit
  convertTemps();

  // Print to DOM
  await presentForecast(cityForecast)
}

// Make changing units search refresh weather data and print new data in correct units to DOM
// Get unit DOM elements
const fahBtn = document.querySelector('#fahBtn');
const celBtn = document.querySelector('#celBtn');
const unitDisplay = document.querySelector('#unitDisplay');

fahBtn.addEventListener('click', async () => {
  if (userUnit === 'C') {
    // Change fahBtn styling to active
    fahBtn.classList.add('active');
    unitDisplay.textContent = 'Fahrenheit';
    // Change celBtn styling to inactive
    celBtn.classList.remove('active');

    // Change userUnit cookie to "F"
    setCookie('userUnit', 'F');
    userUnit = 'F';

    // If the user has weather data already present in the program...
    // Refresh weather data and print it to DOM
    if (cityForecast) {
      // Convert it to the userUnit
      convertTemps();

      // And then print it to DOM
      await presentForecast(cityForecast);
    }
  }
});

celBtn.addEventListener('click', async () => {
  // Change celBtn styling to active
  celBtn.classList.add('active');
  unitDisplay.textContent = 'Celsius';
  // Change fahBtn styling to inactive
  fahBtn.classList.remove('active');

  // Change userUnit cookie to "C"
  await setCookie('userUnit', 'C');
  userUnit = 'C';

  // If the user has weather data already present in the program...
  // Refresh weather data and print it to DOM
  if (cityForecast) {
    // Convert it to the userUnit
    convertTemps();

    // And then print it to DOM
    await presentForecast(cityForecast);
  }
})

function convertTemps () {
  // If user has Celsius selected, convert temps from K to C, otherwise convert to F
  if (getCookie('userUnit') === 'C') {
    cityForecast.currentTemp = toCel(cityForecast.currentTempK);
    for (let i = 0; i < cityForecast.days.length; i++) {
      cityForecast.days[i].max = toCel(cityForecast.days[i].maxK);
      cityForecast.days[i].min = toCel(cityForecast.days[i].minK);
    }
  } else {
    cityForecast.currentTemp = toFah(cityForecast.currentTempK);
    for (let i = 0; i < cityForecast.days.length; i++) {
      cityForecast.days[i].max = toFah(cityForecast.days[i].maxK);
      cityForecast.days[i].min = toFah(cityForecast.days[i].minK);
    }
  }
}

// Takes retrieved weather data and displays it in the DOM
async function presentForecast () {
  // Get the value that the user has input
  const weekDisplay = document.querySelector('.week-display');
  const currentDisplay = document.querySelector('.current-display')
  weekDisplay.innerHTML = '';

  try {
    // Print all the relevant data to the DOM
    currentDisplay.innerHTML = `<h3>${cityForecast.city}, ${cityForecast.country}</h3><br>
    <img src="https://openweathermap.org/img/wn/${cityForecast.days[0].icon}@2x.png" class="current-icon" alt="current weather icon"><br>
    ${cityForecast.currentTemp}${userUnit} ${cityForecast.days[0].clouds}<br>
    High: ${cityForecast.days[0].max}${userUnit}<br>Low: ${cityForecast.days[0].min}${userUnit}<br>
    `
    for (let i = 1; i < cityForecast.days.length; i++) {
      weekDisplay.innerHTML += `
      <div class="card text-center" style="width: 150px">
        <img src="https://openweathermap.org/img/wn/${cityForecast.days[i].icon}@2x.png" class="card-img-top week-icon" alt="weather icon"/>
        <div class="card-body">
          <h5 class="card-title">${cityForecast.days[i].thisDay}</h5>
          <p class="card-subtitle">${cityForecast.days[i].clouds}</p>
          <p class="card-text">High: ${cityForecast.days[i].max}${userUnit}<br>Low: ${cityForecast.days[i].min}${userUnit}</p>
        </div>
      </div>
      `
    }
  } catch (e) {
    console.log(e)
  }
}

// Retrieves weather data from openweathermap and processes it for use.
const getForecast = async (inputCity) => {
  // object to store the output data
  const responseObject = {
    days: [
      {},
      {},
      {},
      {},
      {},
      {},
      {}
    ]
  }

  // use API call to get lat and lon for input city.
  await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&appid=${config.weatherAPIKey}`,
    {
      mode: 'cors'
    }
  )
    .then(response => response.json())
    .then((response) => {
      responseObject.lat = response.coord.lat
      responseObject.lon = response.coord.lon
      responseObject.country = response.sys.country
    })

  // Punch the input city into an API request, using lat and lon
  await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${responseObject.lat}&lon=${responseObject.lon}&exclude=hourly&appid=${config.weatherAPIKey}`,
    {
      mode: 'cors'
    }
  )
    .then(response => response.json())
    .then((response) => {
      // Figure out what today is and store it in a variable.
      const today = new Date()
      const day = today.getDay()
      const dayList = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      // Store input city in response object
      responseObject.city = inputCity

      // Store today's name and the name of the next 6 days in the response object.
      for (let i = 0; i < 7; i++) {
        let thisDay = day + i
        if (thisDay > 6) {
          thisDay -= 7
        }
        thisDay = dayList[thisDay]

        // Also process and store the weather data for today and the next 6 days.
        responseObject.days[i].thisDay = thisDay
        responseObject.days[i].icon = response.daily[i].weather[0].icon
        responseObject.days[i].clouds = response.daily[i].weather[0].description

        // Capitalize the first letter in every Word
        const words = responseObject.days[i].clouds.split(' ');
        for (let j = 0; j < words.length; j++) {
          words[j] = words[j][0].toUpperCase() + words[j].substr(1)
        }
        responseObject.days[i].clouds = words.join(' ');

        // Store numberical data in Kelvin Units
        responseObject.currentTempK = response.current.temp
        responseObject.days[i].maxK = response.daily[i].temp.max
        responseObject.days[i].minK = response.daily[i].temp.min
      }
    })
    // Error handler
    .catch((error) => {
      console.log(error)
    })

  // Return the weather data
  return responseObject
}

firstLoad();
