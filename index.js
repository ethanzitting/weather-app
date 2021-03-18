// Get the button element
const button = document.querySelector('button')

// Make clicking it search for the city in the input cell.
button.addEventListener('click', async function () {
  await presentForecast()
})

// Retrieves API data for city input by user
async function presentForecast () {
  // Get the value that the user has input
  const cityName = document.querySelector('#location').value

  const forecastDisplay = document.querySelector('#forecastDisplay')

  try {
    // Ask the API for the city weather data
    const cityForecast = await getForecast(cityName)

    // Assign that data to the output element in the DOM
    forecastDisplay.innerHTML = `${cityName}: high of ${cityForecast.day[0].max} and ${cityForecast.day[0].clouds}`
  } catch (e) {
    console.log(e)
  }
}

const getForecast = async (inputCity) => {
  // object to store the output
  const responseObject = {
    day: [
      {},
      {},
      {},
      {},
      {},
      {},
      {}
    ]
  }


  // get longitude and latitude
  const latitude = 39.7392;
  const longitude = 104.9903;

  // Punch the input city into an API request
  await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly&appid=${config.weatherAPIKey}`,
    {
      mode: 'cors'
    }
  )
    .then(response => response.json())
    .then((response) => {
      console.log(response);
      // Store the relevant information in the response object

      responseObject.city = inputCity

      for (let i = 0; i < 7; i++) {
        responseObject.day[i].max = (response.daily[i].temp.max - 273.15) * 9 / 5 + 32;
        responseObject.day[i].min = (response.daily[i].temp.min - 273.15) * 9 / 5 + 32;
        responseObject.day[i].clouds = response.daily[i].weather[0].description;
        responseObject.day[i].icon = response.daily[i].weather[0].icon;
      }

      responseObject.day[0].max = Math.round(
        ((response.daily[0].temp.max - 273.15) * 9) / 5 + 32
      )
      responseObject.current = Math.round(
        ((response.current.temp - 273.15) * 9) / 5 + 32
      )
      responseObject.min = Math.round(
        ((response.daily[0].temp.min - 273.15) * 9) / 5 + 32
      )
      responseObject.clouds = response.daily[0].weather[0].description
    })
    // Error handler
    .catch((error) => {
      console.log(error)
    })

  // Return the weather data
  console.log(responseObject)
  return responseObject
}
