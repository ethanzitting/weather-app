// Check user cookies to determine initial units and theme, and most recent city search
let userUnit = "F";
let theme = "light";
let recentCity = 'Colorado Springs'

// Global scope object for weather data.
let cityForecast

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

  // Ask the API for the city weather data
  cityForecast = await getForecast(cityName);

  convertTemps();

  // Convert to userUnit and print to DOM
  await presentForecast(cityForecast)
})

// Make changing units search refresh weather data and print new data in correct units to DOM
// Get unit DOM elements
const fahBtn = document.querySelector('#fahBtn');
const celBtn = document.querySelector('#celBtn');
const unitDisplay = document.querySelector('#unitDisplay');

fahBtn.addEventListener('click', async () => {
  if (userUnit === "C") {
    // Change fahBtn styling to active
    fahBtn.classList.add('active');
    unitDisplay.textContent = "Fahrenheit";
    // Change celBtn styling to inactive
    celBtn.classList.remove('active');

    // Change userUnit cookie to "F"
    userUnit = "F";

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
  unitDisplay.textContent = "Celsius";
  // Change fahBtn styling to inactive
  fahBtn.classList.remove('active');

  // Change userUnit cookie to "C"
  userUnit = "C";

  // If the user has weather data already present in the program...
  // Refresh weather data and print it to DOM
  if (cityForecast) {
    // Convert it to the userUnit
    convertTemps();

    // And then print it to DOM
    await presentForecast(cityForecast);
  }
})

function convertTemps() {
  // If user has Celsius selected, convert temps from K to C, otherwise convert to F
  if (userUnit === "C") {
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
  const forecastDisplay = document.querySelector('#forecastDisplay')

  try {
    // Print all the relevant data to the DOM
    forecastDisplay.innerHTML = `City: ${cityForecast.city}<br>
    Currently: ${cityForecast.days[0].thisDay}, ${cityForecast.currentTemp} ${userUnit}, ${cityForecast.days[0].clouds}<br>
    Today: High: ${cityForecast.days[0].max} ${userUnit}, Low: ${cityForecast.days[0].min} ${userUnit}<br>
    `
    for (let i = 1; i < cityForecast.days.length; i++) {
      forecastDisplay.innerHTML += `
        ${cityForecast.days[i].thisDay}, High: ${cityForecast.days[i].max} ${userUnit}, Low: ${cityForecast.days[i].min} ${userUnit}, ${cityForecast.days[i].clouds}<br>
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
      console.log(response)
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
        responseObject.days[i].clouds = response.daily[i].weather[0].description
        responseObject.days[i].icon = response.daily[i].weather[0].icon

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
