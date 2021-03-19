/* eslint-disable prefer-const */
/* eslint-disable semi */

// Table of Contents
//   - Imports
//   - Table of Contents
//   - Utility Functions used by program
//   - Initial Reading/Setting of Cookies
//   - Set Theme to match cookies
//   - Establish City Name Search Field Event Listener
//   - Load the default city forecast based on the cookies
//   - Add event listeners to power the menu buttons for theme change
//   - 


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

/* Initial Getting and Setting of Cookies */

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

setTheme(theme);

// Global scope object for weather data.
let cityForecast = false;

// Make clicking submit search for the city in the input cell.
$('#forecastSubmit').addEventListener('click', async function () {
  const cityName = $('#location').value

  // If there is a city name in the input field onclick...
  if (cityName) {
    // Variable to tell if the API call succeeded
    let apiSuccess = false;

    // Ask the API for updated city weather data
    try {
      // Store the data in cityForecast
      cityForecast = await getForecast(cityName);
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

      // Convert the temps to the user's chosen unit
      convertTemps();

      // Print to DOM
      presentForecast(cityForecast)
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

  // If the user has weather data already present in the program...
  if (cityForecast) {
    // Convert it to the userUnit
    convertTemps();

    // And then print it to DOM
    presentForecast(cityForecast);
  }

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

// Fires once on load to build the welcome scren for the user.
const firstLoad = async () => {
  // Set Units in Header to match cookie
  setPageUnits(userUnit);

  // Ask the API for the city weather data
  cityForecast = await getForecast(recentCity);

  // Convert the temps to the user's chosen unit
  convertTemps();

  // Print to DOM
  presentForecast(cityForecast)
}

// Make changing units in menu convert data to correct units to DOM
$('#fahBtn').addEventListener('click', async () => setPageUnits('fahrenheit'));

$('#celBtn').addEventListener('click', async () => setPageUnits('celsius'));

$('#light-button').addEventListener('click', () => setTheme('light'))

$('#dark-button').addEventListener('click', () => setTheme('dark'))

// Hotfix to fix broken bootstrap hamburger bar
$('.navbar-toggler').addEventListener('click', () => $('.collapse').classList.toggle('show'));

function convertTemps () {
  // If user has Celsius selected, convert temps from K to C, otherwise convert to F
  if (getCookie('userUnit') === 'celsius') {
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
function presentForecast () {
  // Clear away the old week forecast data
  $('.week-display').innerHTML = '';
  const shortUnit = userUnit[0].toUpperCase();

  try {
    // Print all the new weather data to the DOM
    $('.current-display').innerHTML = `<h3>${cityForecast.city}, ${cityForecast.country}</h3><br>
    <img src="https://openweathermap.org/img/wn/${cityForecast.days[0].icon}@2x.png" class="current-icon" alt="current weather icon"><br>
    ${cityForecast.currentTemp}${shortUnit} ${cityForecast.days[0].clouds}<br>
    High: ${cityForecast.days[0].max}${shortUnit}<br>Low: ${cityForecast.days[0].min}${shortUnit}<br>
    `
    for (let i = 1; i < cityForecast.days.length; i++) {
      $('.week-display').innerHTML += `
      <div class="card text-center" style="width: 150px">
        <img src="https://openweathermap.org/img/wn/${cityForecast.days[i].icon}@2x.png" class="card-img-top week-icon" alt="weather icon"/>
        <div class="card-body">
          <h5 class="card-title">${cityForecast.days[i].thisDay}</h5>
          <p class="card-subtitle">${cityForecast.days[i].clouds}</p>
          <p class="card-text">High: ${cityForecast.days[i].max}${shortUnit}<br>Low: ${cityForecast.days[i].min}${shortUnit}</p>

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
        responseObject.days[i].clouds = capitalize(response.daily[i].weather[0].description);

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
