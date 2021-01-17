$(document).ready(() => {
  $('button').click(async () => {
    // Get the value that the user has input
    cityName = $('#location')
    cityName = cityName.value;
    console.log(cityName)

    // Punch it into the API request
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=727bdceb982e48d1a67cdf8fa8f2c204`)
    .then((response) => {
      // Process the returned JSON object
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    })
  })
}) 

