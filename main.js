// Dom-Elements variables
const locationMenu = document.querySelector(".find-location")
const today = document.querySelector(".today")
const currentLoc = document.querySelector(".current-location span")
const citySearch = document.querySelector(".location-search>input")
const form = document.querySelector("form")
const feh = document.querySelector(".feh")
const cel = document.querySelector(".cel")
const select = document.querySelector("#cities")

let unit = "&deg;C"
const start_date = new Date()
let end_date = new Date(start_date.getTime() + 5 * 24 * 60 * 60 * 1000)
let yourLocation


const startDate = `${start_date.getFullYear()}-${start_date.getMonth() + 1}-${start_date.getDate()}`
const endDate = `${end_date.getFullYear()}-${end_date.getMonth() + 1}-${end_date.getDate()}`

let cities = []
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (p) => {
        yourLocation = p.coords
        cities = await fetchCities()
        getCities()
        await updateAllData()
    }, async (err) => {
        console.log(err)
        cities = await fetchCities()
        getCities()
        await updateAllData()
    })
} else {
    fetchCities().then(data => { cities = data }).then(getCities).then(updateAllData)
}


async function fetchCities() {
    return await (await fetch("https://raw.githubusercontent.com/lmfmaier/cities-json/master/cities500.json")).json()
}

function getCities() {
    let modCities = cities.filter(el => el.name.toLowerCase().startsWith(citySearch.value)).sort((a, b) => a.name > b.name ? 1 : -1).map(el => {
        return `<option data-lat="${el.lat}" data-lon="${el.lon}" value="${el.name}">${el.name} "${el.country.toLowerCase()}"</option>`
    })
    modCities.length = 50
    select.innerHTML = `${!!yourLocation?.longitude ? "<option value='Your Location'>Your Location</option>" : ""}${modCities.join("")}`
    currentLoc.textContent = select.value
}
function formatDates(date) {
    return `${date.toLocaleDateString("en-US", { dateStyle: "medium" })}`
}
function updateDates() {
    let today = new Date()
    const todayDateEl = document.querySelector(".date-str")
    const nextDaysDate = document.querySelectorAll(".day-data .date")
    const todayString = formatDates(today)
    todayDateEl.textContent = todayString
    nextDaysDate.forEach((el, ind) => {
        if (ind != 0) {
            const date = new Date(today.getTime() + (ind + 1) * 24 * 60 * 60 * 1000)
            el.textContent = formatDates(date)
        }
    })
}
async function getWeatherData() {
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${select?.selectedOptions[0]?.dataset.lat || yourLocation?.latitude}&longitude=${select?.selectedOptions[0]?.dataset.lon || yourLocation?.longitude}&hourly=relativehumidity_2m,surface_pressure,visibility&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&${unit == "&deg;F" ? "temperature_unit=fahrenheit" : ""}&windspeed_unit=mph&start_date=${startDate}&end_date=${endDate}&timezone=Africa%2FCairo`
    return await (await fetch(api)).json()
}
function updateTodayData(weatherData) {

    const todayTemp = document.querySelector(".temp :first-child")
    const todayImg = document.querySelector(".todays-weather-img")
    const todayCond = document.querySelector(".cond")
    const windSpeed = document.querySelector(".wind p")
    const winddir = document.querySelector(".wind .dir span")
    let humidityData = structuredClone(weatherData.hourly["relativehumidity_2m"])
    humidityData.length = 24
    let humPrecentage = Math.round(humidityData.reduce((acc, el) => acc + el, 0) / 24)
    const humidityValue = document.querySelector(".humidity p")
    const humbar = document.querySelector(".humidity .value span")
    let visibilityData = structuredClone(weatherData.hourly.visibility)
    const visibilityTxt = document.querySelector(".visibility p")
    let pressData = structuredClone(weatherData.hourly["surface_pressure"])
    const pressTxt = document.querySelector(".airpress p")


    todayTemp.textContent = `${Math.trunc(weatherData["current_weather"].temperature)}`

    if (weatherData["current_weather"].weathercode == 0 || weatherData["current_weather"].weathercode == 1) {
        todayImg.src = "./images/Clear.png"
        todayCond.textContent = "Clear"
    } else if (weatherData["current_weather"].weathercode == 2) {
        todayImg.src = "./images/LightCloud.png"
        todayCond.textContent = "Light Cloud"
    } else if (weatherData["current_weather"].weathercode == 3 || weatherData["current_weather"].weathercode == 45 || weatherData["current_weather"].weathercode == 48) {
        todayImg.src = "./images/HeavyCloud.png"
        todayCond.textContent = "Heavy Cloud"
    } else if (weatherData["current_weather"].weathercode == 55 || weatherData["current_weather"].weathercode == 63 || weatherData["current_weather"].weathercode == 65) {
        todayImg.src = "./images/HeavyRain.png"
        todayCond.textContent = "Heavy Rain"
    } else if (weatherData["current_weather"].weathercode == 51 || weatherData["current_weather"].weathercode == 53 || weatherData["current_weather"].weathercode == 61) {
        todayImg.src = "./images/LightRain.png"
        todayCond.textContent = "Light Rain"
    } else if (weatherData["current_weather"].weathercode == 56 || weatherData["current_weather"].weathercode == 57 || weatherData["current_weather"].weathercode == 66 || weatherData["current_weather"].weathercode == 67) {
        todayImg.src = "./images/Sleet.png"
        todayCond.textContent = "Sleet"
    } else if (weatherData["current_weather"].weathercode == 71 || weatherData["current_weather"].weathercode == 75 || weatherData["current_weather"].weathercode == 73 || weatherData["current_weather"].weathercode == 77) {
        todayImg.src = "./images/Snow.png"
        todayCond.textContent = "Snow Fall"
    } else if (weatherData["current_weather"].weathercode == 80 || weatherData["current_weather"].weathercode == 81 || weatherData["current_weather"].weathercode == 85 || weatherData["current_weather"].weathercode == 82 || weatherData["current_weather"].weathercode == 86) {
        todayImg.src = "./images/Shower.png"
        todayCond.textContent = "Shower"
    } else if (weatherData["current_weather"].weathercode == 95) {
        todayImg.src = "./images/Thunderstorm.png"
        todayCond.textContent = "Thunder Storm"
    } else {
        todayImg.src = "./images/Hail.png"
        todayCond.textContent = "Hail"
    }
    windSpeed.textContent = `${weatherData["current_weather"].windspeed}mph`
    winddir.style.transform = `rotate(${weatherData["current_weather"].winddirection - 45}deg)`

    humidityValue.textContent = `${humPrecentage}%`
    humbar.style.width = `${humPrecentage}%`
    visibilityData.length = 24
    visibilityData = Math.round(visibilityData.reduce((acc, el) => acc + el, 0) / (24 * 1600))
    visibilityTxt.textContent = `${visibilityData} miles`
    pressData.length = 24
    pressData = Math.round(pressData.reduce((acc, el) => acc + el, 0) / 24)
    pressTxt.textContent = `${pressData} hPa`


}
function updateNextDaysData(weatherData) {

    const maxTemp = document.querySelectorAll(".max")
    const minTemp = document.querySelectorAll(".min")
    const dayImg = document.querySelectorAll(".day-data img")
    maxTemp.forEach((el, ind) => {
        el.innerHTML = `${Math.round(weatherData["temperature_2m_max"][ind + 1])}${unit}`
    })
    minTemp.forEach((el, ind) => {
        el.innerHTML = `${Math.round(weatherData["temperature_2m_min"][ind + 1])}${unit}`
    })
    dayImg.forEach((el, ind) => {
        if (weatherData.weathercode[ind + 1] == 0 || weatherData.weathercode[ind + 1] == 1) {
            el.src = "./images/Clear.png"
        } else if (weatherData.weathercode[ind + 1] == 2) {
            el.src = "./images/LightCloud.png"
        } else if (weatherData.weathercode[ind + 1] == 3 || weatherData.weathercode[ind + 1] == 45 || weatherData.weathercode[ind + 1] == 48) {
            el.src = "./images/HeavyCloud.png"
        } else if (weatherData.weathercode[ind + 1] == 55 || weatherData.weathercode[ind + 1] == 63 || weatherData.weathercode[ind + 1] == 65) {
            el.src = "./images/HeavyRain.png"
        } else if (weatherData.weathercode[ind + 1] == 51 || weatherData.weathercode[ind + 1] == 53 || weatherData.weathercode[ind + 1] == 61) {
            el.src = "./images/LightRain.png"
        } else if (weatherData.weathercode[ind + 1] == 56 || weatherData.weathercode[ind + 1] == 57 || weatherData.weathercode[ind + 1] == 66 || weatherData.weathercode[ind + 1] == 67) {
            el.src = "./images/Sleet.png"
        } else if (weatherData.weathercode[ind + 1] == 71 || weatherData.weathercode[ind + 1] == 75 || weatherData.weathercode[ind + 1] == 73 || weatherData.weathercode[ind + 1] == 77) {
            el.src = "./images/Snow.png"
        } else if (weatherData.weathercode[ind + 1] == 80 || weatherData.weathercode[ind + 1] == 81 || weatherData.weathercode[ind + 1] == 85 || weatherData.weathercode[ind + 1] == 82 || weatherData.weathercode[ind + 1] == 86) {
            el.src = "./images/Shower.png"
        } else if (weatherData.weathercode[ind + 1] == 95) {
            el.src = "./images/Thunderstorm.png"
        } else {
            el.src = "./images/Hail.png"
        }
    })
}
async function updateAllData() {
    updateDates()
    const weatherData = await getWeatherData()
    updateTodayData(weatherData)
    updateNextDaysData(weatherData.daily)
}

select.addEventListener("change", async () => {
    currentLoc.textContent = select.value
    await updateAllData()

})
form.addEventListener("submit", async e => {
    e.preventDefault()
    getCities()
    await updateAllData()
})


feh.addEventListener("click", async function () {
    this.classList.add("activated")
    cel.classList.remove("activated")
    unit = "&deg;F"
    document.querySelector(".deg").innerHTML = unit
    await updateAllData()
})
cel.addEventListener("click", async function () {
    this.classList.add("activated")
    feh.classList.remove("activated")
    unit = "&deg;C"
    document.querySelector(".deg").innerHTML = unit
    await updateAllData()
})
