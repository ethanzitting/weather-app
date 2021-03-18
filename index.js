// Get the button element
const button = document.querySelector('#forecastSubmit')

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
    forecastDisplay.innerHTML = `City: ${cityForecast.city}<br>
    Currently: ${cityForecast.days[0].thisDay}, ${cityForecast.currentTemp} F, ${cityForecast.days[0].clouds}<br>
    `
    for (let i = 1; i < cityForecast.days.length; i++)  {
      forecastDisplay.innerHTML += `
        ${cityForecast.days[i].thisDay}, High: ${cityForecast.days[i].max} F, Low: ${cityForecast.days[i].min} F, ${cityForecast.days[i].clouds}<br>
      `
    }

    console.log(cityForecast.days[0].thisDay);
    console.log(cityForecast);
  } catch (e) {
    console.log(e)
  }
}

const getForecast = async (inputCity) => {
  // object to store the output
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
      const today = new Date();
      const day = today.getDay();
      const dayList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      responseObject.city = inputCity

      for (let i = 0; i < 7; i++) {
        let thisDay = day + i;
        if (thisDay > 6) {
          thisDay -= 7;
        }
        thisDay = dayList[thisDay]

        responseObject.currentTemp = Math.round((response.daily[i].temp.max - 273.15) * 9 / 5 + 32);
        responseObject.days[i].thisDay = thisDay;
        responseObject.days[i].max = Math.round((response.daily[i].temp.max - 273.15) * 9 / 5 + 32);
        responseObject.days[i].min = Math.round((response.daily[i].temp.min - 273.15) * 9 / 5 + 32);
        responseObject.days[i].clouds = response.daily[i].weather[0].description;
        responseObject.days[i].icon = response.daily[i].weather[0].icon;
      }
    })
    // Error handler
    .catch((error) => {
      console.log(error)
    })
  
  console.log(responseObject);

  // Return the weather data
  return responseObject
}
