
document.getElementById('body').onload= function() {
    getCode();
    getLocation();
};


let longitud = ''
let latitud = ''
let data = ''
let dataDaily = ''
let code = ''
let cityInfo  = '';
let adress = ''

function getHour(){
    let months = ['Jan', "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept","Oct","Nov", "Dec"]
    const d = new Date();
    let currentMonth = months[d.getMonth()]
    let currentDay = d.getDate()
    let hour = d.getHours()
    let currentMinutes = d.getMinutes()
    document.getElementById('currentDay').innerHTML = `
    <h5> Today ${currentDay} ${currentMonth} </h5>
    `
    document.getElementById('hour').innerHTML = `
    <h5>${hour}:${currentMinutes}</h5>
    `
    return hour
    
}


async function getLocation(){

    if(navigator.geolocation){
        return navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        alert('geolocation not available in this navigator')
    }
}


async function showPosition(position){
    longitud =  position.coords.longitude; 
    latitud =  position.coords.latitude;
    getWeather(latitud, longitud)
    getCityName(latitud, longitud)
    console.log(longitud, latitud)
}

async function getWeather(lat, lon){
    try{
        const response = await fetch (`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m&hourly=apparent_temperature&hourly=weathercode&hourly=relativehumidity_2m&hourly=windspeed_10m&hourly=precipitation&hourly=cloudcover&hourly=snowfall`);
        if (response.ok){
            const jsonResponse = await response.json()
            data = jsonResponse
            console.log(data)
            getDailyWeather(lat,lon)
            
            temperature()
            weathercode()
            upComingHours()
            humidity()
            feelsLike()
            clouds()
            rain()
            wind()
            snow()
        }

    }catch (error){
        console.log(error)
    }
   
}

async function getDailyWeather(lat,lon){
    try {
        const response = await fetch ( `https://api.open-meteo.com/v1/forecast?timezone=auto&latitude=${lat}&longitude=${lon}&daily=temperature_2m_max&daily=temperature_2m_min&daily=weathercode`)
        if (response.ok){
            const jsonResponse = await response.json()
            dataDaily = jsonResponse
            console.log(dataDaily)
            upComingDays()
           

        }
    }catch (error){
        console.log(error)
    }

}


async function getCode(){
    try{
        const response = await fetch(`./weathercode.json`);
        if (response.ok){
            const jsonResponse = await response.json()
            code = jsonResponse
        }
    }catch(error){
        console.log(error)
    }

}

async function getCityCoords(city, country){
    
    try{
        const response = await fetch (`https://nominatim.openstreetmap.org/search.php?city=${city}&country=${country}&format=jsonv2`);
        if (response.ok){
            const jsonResponse = await response.json()
            cityInfo = jsonResponse
            if (cityInfo.length === 0){
                window.alert('your city doesnt exist')
            }
            console.log(cityInfo)
            let lat = cityInfo[0]['lat']
            let long = cityInfo[0]['lon']
            getWeather(lat, long)
            document.getElementById('nameCity').innerHTML = `<h3> ${city}</h3>`
        }

    }catch (error){
        console.log(error)
    }
}

async function getCityName(lat, lon){
    try{
        const response = await fetch (`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=10&format=jsonv2`)
        if (response.ok){
        const jsonResponse = await response.json()
        adress = jsonResponse
        console.log(adress)
        cityNameDiv()
        let city_name = adress['name']
        let country_name = adress['address']['country']
        document.getElementById('site-search-city').value = city_name;
        document.getElementById('site-search-country').value = country_name
        }

    }catch (error){
        console.log(error)

    }
    

   
}

function cityNameDiv(){
    let city = adress['name']
    document.getElementById('nameCity').innerHTML = `
    <h3> ${city}</h3>
    `
}



function temperature(){
    let hour = getHour()
    let temperature = data.hourly['temperature_2m'][hour]
    temperature = Math.floor(temperature)
    document.getElementById('degrees').innerHTML= `<h2> ${temperature} ??C </h2>`
}

function weathercode(){
    let hour = getHour()
    let weather = data.hourly['weathercode'][hour]
    let weatherState = code[weather][0];
    let weatherImg = code[weather][1]; 
    document.getElementById("weatherState").innerHTML = `

    <i class="${weatherImg}"> </i>
    <h3> ${weatherState}</h3>
    
    `
}

function upComingHours(){
    let nextHours  = []
    let nextTemperatures = []
    let nextWeatherCodes = []
    let currentHour = getHour()
    let currentTemperature = data.hourly['temperature_2m'][currentHour]
    let currentWeatherCode = data.hourly['weathercode'][currentHour]
    for (let i = 1 ; i < 9; i++){
        let hourToAdd = data.hourly['time'][currentHour+i]
        hourToAdd = hourToAdd.slice(11,13)
        nextHours.push(hourToAdd)
        let tempToAdd = data.hourly['temperature_2m'][currentHour+i]
        nextTemperatures.push(tempToAdd)
        let codeToAdd = data.hourly['weathercode'][currentHour+i]
        nextWeatherCodes.push(codeToAdd)

    }

    document.getElementById('nextHours').innerHTML =  createNowDiv(currentHour, currentTemperature, currentWeatherCode)
    
    
    for (let i = 0; i< 8; i++){
        
    document.getElementById('nextHours').innerHTML += createNextHoursDivs(nextHours[i], nextTemperatures[i], nextWeatherCodes[i])
    }

}

function upComingDays(){
    let nextDaysDates =  dataDaily['daily']['time']
    let nextDaysNames = []
    let nextDaysMaxTemperatures = dataDaily['daily']['temperature_2m_max']
    let nextDaysWeatherCodes = dataDaily['daily']['weathercode']
    let nextDaysMinTemperatures =  dataDaily['daily']['temperature_2m_min']
    let weekDays = ['Sun','Mon', 'Tues', "Wed", 'Thu', 'Fri', 'Sat']
    for (let i = 0; i < 7; i++){
        let rawDate = nextDaysDates[i]
        let year = rawDate.slice(0,4)
        let month = rawDate.slice(5,7)
        let day = rawDate.slice(8, 10)
        let d = new Date(`${year}", "${month}", "${day}"`)
        let dayName = weekDays[d.getDay()]
        nextDaysNames.push(dayName)
    }

    document.getElementById('nextDays').innerHTML = ''
    for (let i= 0; i < 7; i++){
    document.getElementById('nextDays').innerHTML += createNextDaysForecast(nextDaysNames[i], nextDaysMaxTemperatures[i], nextDaysMinTemperatures[i], nextDaysWeatherCodes[i] )
    }
   
  
}

function createNextDaysForecast(day, maxT, minT, codes){
    
    return `
    <div class= 'inNextDays'>
    <h3> ${day} </h3>
    <i class = "${code[codes][1]} fa-2x"> </i>
    <h3> ${Math.floor(maxT)}??C </h3>
    <h3> ${Math.floor(minT)}??C </h3>
    </div>

    `

}

function createNowDiv (hour, temperature, codes) {

    return `<div class = 'inNextHours'> 
    <h3> now </h3>
    <i class = "${code[codes][1]} fa-2x"> </i>
    <h3> ${Math.floor(temperature)}??C </h3>
    
    </div>
    `
}

function createNextHoursDivs (hour,temperature,codes){
    return `<div class = 'inNextHours'> 
    <h3> ${hour}:00 </h3>
    <i class = "${code[codes][1]} fa-2x">  </i>
    <h3> ${Math.floor(temperature)}??C </h3>

    </div>
    
    `
}

function humidity(){
    let currentHour = getHour()
    let currentHumidity= data.hourly['relativehumidity_2m'][currentHour]
    document.getElementById('humidity').innerHTML = `
    <div class = 'title'> 
    <h4> Humidity</h4>
    <i class="fa-solid fa-droplet"></i>
    </div>
    
    <h3> ${currentHumidity}%</h3>
    
    `
}

function feelsLike(){
    let currentHour = getHour()
    let currentFeelLike= data.hourly['apparent_temperature'][currentHour]
    document.getElementById('feelsLike').innerHTML = `
    <div class= 'title'> 
    <h4> Feels like </h4>
    <i class="fa-solid fa-temperature-empty"></i>
    </div>
    
    <h3> ${Math.floor(currentFeelLike)}??C</h3>
    
    `
}

function clouds(){
    let currentHour = getHour()
    let currentClouds = data.hourly['cloudcover'][currentHour]
    document.getElementById('clouds').innerHTML = `
    <div class = 'title'> 
    <h4> Clouds</h4>
    <i class="fa-solid fa-cloud"></i>
    </div>
    <h3> ${currentClouds}%</h3>

    `
}

function rain(){
    let currentHour = getHour()
    let currentRain = data.hourly['precipitation'][currentHour];
    document.getElementById('rain').innerHTML = `
    <div class = 'title'>
    <h4>Rain </h4>
    <i class="fa-solid fa-cloud-showers-heavy"></i>
    </div>
    <h3> ${currentRain} mm</h3>
    `
}

function wind(){
    let currentHour = getHour();
    let currentWind = data.hourly['windspeed_10m'][currentHour];
    document.getElementById('wind').innerHTML = `
    <div class = 'title'>
    <h4>Wind </h4>
    <i class="fa-solid fa-wind"></i>
    </div>
    <h3> ${currentWind} km/h</h3>
    
    `
}

function snow(){
    let currentHour = getHour();
    let currentSnow = data.hourly['snowfall'][currentHour];
    document.getElementById('snow').innerHTML = `
    <div class = 'title'>
    <h4> SnowFall </h4>
    <i class="fa-solid fa-wind"></i>
    </div>
    <h3> ${currentSnow} cm </h3>
    
    `
}

let searchCountry= document.getElementById('site-search-country');
searchCountry.addEventListener('keydown', function(event){
    if(event.key === 'Enter'){
        let city = document.getElementById('site-search-city').value
        city = city.toLowerCase()
        let country = document.getElementById('site-search-country').value
        country = country.toLowerCase()
        console.log(city, country)
        getCityCoords(city, country)
        
    }


})
