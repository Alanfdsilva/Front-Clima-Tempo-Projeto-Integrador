<template>
  <div class="container">
    <div v-if="!isLoading">
      <client-only>
        <Map v-if="showMapSelector" @closeMapPopup="closeMapPopup" @updateCoordinates="handleCoordinatesUpdate"/>
      </client-only>
      <SendWeatherFeedback v-if="showWeatherPopup" style="z-index: 900;" @closeWeatherPopup="closeWeatherPopup" @updateFeedbacks="getFeedbacks" :weather-infos="weather"/>
      <h3 class="app-title">Weather App</h3>
      <div class="search-container">
        <div>
          <div class="filter-search">
            <img src="../assets/icons/search.svg">
            <input v-model="city" type="text" placeholder="Search">
          </div>
          <button type="button" class="btn-send-feedback btn-limiter" @click="getWeatherInfo">
            <small>Search</small>
          </button>
        </div>
        <button type="button" class="btn-send-feedback btn-limiter" @click="showMapSelector=true">
          <img src="../assets/icons/location.svg">
        </button>
      </div>

      <p class="input-error" v-if="showInputError">{{showInputErrorMessage}}</p>


      <div v-if="alert && alert.category" class="alert-container">
        <div class="alert-content-container">
          <h3>Alert registered at {{ weather.location.name }} - {{ weather.location.country }}</h3>
          <span v-show="alert.headline" class="alert-content">From: {{ alert.headline }}</span>
          <span v-show="alert.category" class="alert-content">Category: {{ alert.category }}</span>
          <span v-show="alert.event" class="alert-content">Event: {{ alert.event }}</span>
          <span v-show="alert.instruction" class="alert-content">Instruction: {{ alert.instruction }}</span>
        </div>
      </div>
      <div class="weather-container">
        <div class="weather-content-container">
          <div class="weather-place-infos-container">
            <div class="weather-place-info-left">
              <p>{{ weather.location.name }} - {{ weather.location.country }}</p>
            </div>
            <p class="weather-last-update">Last Update: {{ weather.current.last_updated }}</p>
          </div>
          <div class="weather-content-main-container">
            <div class="weather-content-main">
              <img :src="'https:' + weather.current.condition.icon">
              <h1>{{ weather.current.temp_c }}°C</h1>
              <span>{{ weather.current.condition.text }}</span>
            </div>
            <div class="weather-content-box-container">
              <div class="weather-content-box">
                <img src="../assets/icons/humidity.svg" style="height: 40px;">
                <div class="box-right-container">
                  <p>{{ weather.current.humidity }}%</p>
                  <h2>Humidity</h2>
                </div>
              </div>

              <div class="weather-content-box">
                <img src="../assets/icons/wind.svg" style="height: 40px;">
                <div class="box-right-container">
                  <p>{{ weather.current.wind_kph }}Km/H</p>
                  <h2>Wind Speed</h2>
                </div>
              </div>

              <div class="weather-content-box">
                <img src="../assets/icons/temp.svg" style="height: 40px;">
                <div class="box-right-container">
                  <p>{{ weather.current.feelslike_c }}°C</p>
                  <h2>Feels Like</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="weather-content-feedback">
          <div class="weather-content-feedback-header">
            <h3>Users Feedback</h3>
            <img @click.prevent="openWeatherPopup" src="../assets/icons/add-box.svg">
          </div>
          <div v-for="feedback in feedbacks" :key="feedback.id" class="weather-content-feedback-container">
            <div class="weather-content-feedback-box">
              <p>{{ feedback.user_name ? feedback.user_name : "Anonymous"}}</p>
              <div class="star_rate">
                <img src="../assets/icons/star.svg">
                <span>{{ feedback.rate }}</span>
              </div>
            </div>
            <p>app feels like: {{ feedback.viewed_temperature }}°C</p>
            <p>user feels like temperature: {{ feedback.perceived_temperature }}°C</p>
            <p>data created: {{ feedback.created_at }}</p>
            <p>{{ feedback.description }}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="container_loading" v-else>
      <div class="loadingSpinner" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isLoading: true,
      feedbacks: [],
      showWeatherPopup: false,
      city: '',
      weather: {},
      showInputErrorMessage: "",
      showInputError: false,
      showMapSelector: false,
      alert: {}
    };
  },
  async mounted() {
    this.isLoading = true

    await this.findGeoLocation();
  },
  methods: {
    closeMapPopup() {
      this.showMapSelector = false
    },  

    async findGeoLocation() {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
        async(position) => {
          const { latitude, longitude } = position.coords;
          await this.getWeatherInfoByLonLat(latitude, longitude);
        },
        async(error) => {
            await this.getWeatherInfo();
          }
        );
      } else {
        await this.getWeatherInfo();
      }
    },
    handleCoordinatesUpdate({ lat, lng }) {
      this.getWeatherInfoByLonLat(lat, lng);
    },
    async getWeatherInfoByLonLat(latitude, longitude) {
      this.showMapSelector = false
      this.isLoading = true
      try {
        const response = await this.$axios.get(
          `https://api.weatherapi.com/v1/current.json?key=${proccess.env.NUXT_ENV_APIKEY}` + 
          '&q=' +
          latitude + " " + longitude +
          '&dt=' +
          new Date().toISOString().slice(0, 10) +
          '&alerts=yes&lang=en'
        , {
          headers: {
            'User-Agent': 'insomnia/8.6.1'
          }
        });
        this.weather = response.data;

        const forecastResponse = await this.$axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${proccess.env.NUXT_ENV_APIKEY}` + 
          '&q=' +
          latitude + " " + longitude +
          '&dt=' +
          new Date().toISOString().slice(0, 10) +
          '&alerts=yes&lang=en'
        , {
          headers: {
            'User-Agent': 'insomnia/8.6.1'
          }
        });

        if(forecastResponse.data.alerts.alert.length > 0) {
          this.alert = "Alert: " + forecastResponse.data.alerts.alert[0]
        } else {
            this.alert = {
              category: "",
              headline: "",
              event: "",
              instruction: "",
            }
        }

        this.showInputError = false;
      } catch (weatherError) {
        if (weatherError.response && weatherError.response.data.error && weatherError.response.data.error.code === 1006) {
          this.showInputError = true;
          this.showInputErrorMessage = "* No matching location found."
        } else {
          console.error('Erro ao obter a previsão do tempo:', weatherError);
        }
      }

      try {
        await this.getFeedbacks();
      } catch (feedbackError) {
        console.error('Erro ao obter os feedbacks:', feedbackError);
      }

      this.isLoading = false;
    },
    async getWeatherInfo() {
      if(!this.city) {
        this.city = "São Paulo"
      }
      this.isLoading = true
      try {
        const response = await this.$axios.get(
          `https://api.weatherapi.com/v1/current.json?key=${proccess.env.NUXT_ENV_APIKEY}` + 
          '&q=' +
          this.city +
          '&dt=' +
          new Date().toISOString().slice(0, 10) +
          '&alerts=yes&lang=en'
        , {
          headers: {
            'User-Agent': 'insomnia/8.6.1'
          }
        });
        this.weather = response.data;

        const forecastResponse = await this.$axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${proccess.env.NUXT_ENV_APIKEY}` + 
          '&q=' +
          latitude + " " + longitude +
          '&dt=' +
          new Date().toISOString().slice(0, 10) +
          '&alerts=yes&lang=en'
        , {
          headers: {
            'User-Agent': 'insomnia/8.6.1'
          }
        });

        if(forecastResponse.data.alerts.alert.length > 0) {
          this.alert = "Alert: " + forecastResponse.data.alerts.alert[0]
        } else {
          this.alert = {
            category: "",
            headline: "",
            event: "",
            instruction: "",
          }
        }

        this.showInputError = false;
      } catch (weatherError) {
        if (weatherError.response && weatherError.response.data.error && weatherError.response.data.error.code === 1006) {
          this.showInputError = true;
          this.showInputErrorMessage = "* No matching location found."
        } else {
          console.error('Erro ao obter a previsão do tempo:', weatherError);
        }
      }

      try {
        await this.getFeedbacks();
      } catch (feedbackError) {
        console.error('Erro ao obter os feedbacks:', feedbackError);
      }

      this.isLoading = false;
    },
    async getFeedbacks() {
      try {
        const response = await this.$axios.get(`http://localhost:3333/feedback/${this.weather.location.name}`);

        this.feedbacks = response.data
      } catch (error) {
        console.log(error.message); 
      }
    },
    openWeatherPopup () {
      this.showWeatherPopup = true
    },
    closeWeatherPopup () {
      this.showWeatherPopup = false
    },
  },
};
</script>

<style lang="scss">

@font-face {
  font-family: "Material Icons";
  font-style: normal;
  font-weight: 400;
  src: url("../assets/material-icons/material-icons.woff2") format("woff2");
}

#map {
  width: 100%;
  height: 500px;
}

.material-icons {
  font-family: "Material Icons";
  font-weight: normal;
  font-style: normal;
  font-size: 24px; /* Preferred icon size */
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;

  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: "liga";
}

body {
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #F7F9FB;

}

.app-title {
  font-size: 28px;
  font-family: Verdana;
  align-self: center;
  width: 100%;
}

.weather-place-infos-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  padding: 22px;
}

.alert-container {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  border: 1px solid #E73550;
  background-color: #FFF;
  width: 100%;
  border-radius: 8px;
  margin: 16px 0px;
}

.alert-content-container {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  width: 100%;
  padding: 16px;
}

.alert-container h3{
  font-family: Verdana;
  color: #E73550;
  font-size: 16px;
  margin: 0px;
  margin-bottom: 12px;
}

.alert-content {
  font-family: Verdana;
  color: #000;
  margin-top: 4px;
  font-size: 13px;
}

.weather-place-info-left p {
  font-size: 12px;
  font-family: Verdana;
  margin: 0px;
}

.btn-limiter {
  margin-left: 8px;
}

.container {
  padding: 22px;
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  padding-bottom: 42px;
}

.container_loading {
  padding: 22px;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.filter-search{
  position: relative;
  display: inline-block;
  border-radius: 10px;
  border: 1px solid #D1D1D1;
  background: var(--Neutras-Claro-Plano-de-fundo, #FFF);
}

.weather-last-update {
  font-size: 12px;
  margin: 0px;
  font-family: Verdana;
}

.weather-container {
  display: flex; 
  flex-direction: row;  
  margin: 16px 0px;
}

.weather-content-main-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: auto;
}

.weather-content-container {
  background-color: #FFF;
  width: 70%;
  border: 1px solid #D1D1D1;
  border-radius: 8px;
  flex-direction: column;
  margin-right: 18px;
}

.weather-content-feedback {
  padding: 22px;
  background-color: #FFF;
  flex: 1; 
  border: 1px solid #D1D1D1;
  border-radius: 8px;
  flex-direction: column;
  max-height: 300px;
  overflow-y: auto;
  align-items: center;
  justify-content: center;
}

.weather-content-feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

}

.weather-content-feedback-header img{
  cursor: pointer;
  color: #00ABFF;
}

.search-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.weather-content-feedback-header h3 {
  font-family: verdana;
  margin: 0px;
  font-size: 16px; 
  padding: 0px; 
}

.weather-content-feedback-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #D1D1D1;
  padding: 18px;
  border-radius: 8px;
  margin-top: 18px;
}

.weather-content-feedback-container p{
  font-family: verdana;
  margin: 0px;
  font-size: 12px; 
  padding: 0px; 
  margin-top: 6px;
}

.weather-content-feedback-box {
  display: flex;
  flex-direction: row;
  gap: 8px;
  justify-content: space-between;
  align-items: center;
}


.weather-content-feedback-box p{
  margin: 0px;
  font-size: 14px;
  font-family: verdana;
  font-weight: bold;
}

.star_rate {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.star_rate img{
  width: 22px;
}

.star_rate span {
  margin: 0px;
  font-size: 14px;
  font-family: verdana;
}


.weather-content-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.weather-content-main img{
  width: 60px;
}

.weather-content-main h1{
  font-size: 20px;
  font-family: Verdana;
  margin: 4px 0px;
}

.weather-content-main span{
  font-size: 20px;
  font-family: Verdana;
  margin-bottom: 22px;
}


.weather-content-main h2{
  font-size: 20px;
  font-family: Verdana;
  margin: 4px 0px;
}

.weather-content-main p{
  font-size: 16px;
  font-family: Verdana;
  margin: 4px 0px;
}

.weather-content-box-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 22px;
  flex-direction: row;
}

.box-right-container {
  margin-left: 6px;
}

.input-error {
  font-family: verdana;
  align-self: flex-start;
  font-size: 12px;
  margin: 8px 0px;
  color: #E73550;
}

.weather-content-box p{
  font-size: 14px;
  font-family: Verdana;
  text-align: center;
  margin: 4px 0px 0px 0px;
}

.weather-content-box h2{
  font-size: 14px;
  font-family: Verdana;
  text-align: center;
  margin: 4px 0px 0px 0px;
}

.weather-content-box {
  display: flex;
  flex-direction: row;
  border: 1px solid #D1D1D1;
  padding: 8px;
  border-radius: 8px;
}


.filter-search input{
  padding: 10px;
  padding-left: 40px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;

  color: var(--DNC-Azul-Dark, #24292F);

  font-family: Verdana;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px;
}

.filter-search img{
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  width: 20px; 
  height: auto;
  cursor: pointer;
}


@media screen and (max-width: 870px) {
  .weather-container {
    flex-direction: column;  
  }

  .weather-content-container {
    margin-bottom: 22px;
    width: 100%;
  }
  
}


.loadingSpinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-top-color: #000;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
