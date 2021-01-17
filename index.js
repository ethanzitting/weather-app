const button = document.querySelector("button");
button.addEventListener("click", () => {
  // Get the value that the user has input
  let cityName = document.querySelector("#location").value;
  console.log(cityName);

  // Punch it into the API request
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${config.weatherAPIKey}`
  )
    .then((response) => {
      // Process the returned JSON object
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });
});
