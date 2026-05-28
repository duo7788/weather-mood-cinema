const form = document.querySelector(".city-form");
const cityInput = document.querySelector("#city");
const previewCity = document.querySelector("#preview-city");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();
  previewCity.textContent = city || "Your city";
});
