<template>
  <div class="map_container" @click="closeMapPopupOutside">
    <div class="map_container_content_container" @click.stop>
      <h3 class="map_container_subtitle">
        Select a place
      </h3>
      <div v-if="isClient" id="map"></div>
      <div v-if="selectedLocation" class="confirmation-container">
        <div class="city-infos">
          <p>City: {{ selectedLocation.cityName }}</p>
          <p>Latitude: {{ selectedLocation.lat }}</p>
          <p>Longitude: {{ selectedLocation.lng }}</p>
        </div>
        <button type="button" class="btn-send-feedback" @click="confirmLocation">
          <small>Confirm</small>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick } from 'vue';
import L from 'leaflet';

export default {
  setup(_, { emit }) {
    const isClient = ref(false);
    const map = ref(null);
    const currentMarker = ref(null);
    const selectedLocation = ref(null);

    onMounted(async () => {
      isClient.value = true;

      if (process.client) {
        await nextTick();
        map.value = L.map('map').setView([51.505, -0.09], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map.value);

        map.value.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          const cityName = await getCityName(lat, lng);
          addMarker(lat, lng, cityName);
          selectedLocation.value = { lat, lng, cityName };
        });
      }
    });

    const getCityName = async (lat, lng) => {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.address.city || data.address.town || data.address.village || "Unknown location";
    };

    const addMarker = (lat, lng, cityName) => {
      if (currentMarker.value) {
        map.value.removeLayer(currentMarker.value);
      }
      currentMarker.value = L.marker([lat, lng]).addTo(map.value)
        .bindPopup(`<div>City: ${cityName}</div>`)
        .openPopup();
    };

    const confirmLocation = () => {
      if (selectedLocation.value) {
        emit('updateCoordinates', selectedLocation.value);
        this.closePopup();
      }
    };

    const closePopup = () => {
      if (currentMarker.value) {
        map.value.removeLayer(currentMarker.value);
      }
      selectedLocation.value = null;
      emit('closeMapPopup'); // Emitir o evento para informar o componente pai que o popup deve ser fechado
    };

    return { isClient, selectedLocation, confirmLocation, closePopup };
  },
  methods: {
    closeMapPopupOutside(event) {
      if (event.target.classList.contains('map_container')) {
        this.closePopup();
      }
    },
  }
}
</script>

<style scoped>
#map {
  width: 100%;
  height: 350px;
}

.map_container {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(217, 217, 217, 0.60);
  justify-content: center;
  align-items: center;
  padding: 40px 60px;
}

.map_container_content_container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  background-color: #fefefe;
  padding: 40px;
  border: 1px solid #C6CACE;
  box-shadow: 0px 3.2px 7.2px rgba(0, 0, 0, 0.13), 0px 0.6px 1.8px rgba(0, 0, 0, 0.11);
  width: 90%;
  max-width: 700px;
  border-radius: 16px;
  position: relative;
}

.map_container_subtitle {
  font-family: verdana;
  font-size: 1.25rem;
  margin: 0px;
  margin-bottom: 8px;
}

.confirmation-container {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
}

.city-infos {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.city-infos p{
  padding: 0px;
  font-family: Verdana;
  margin: 4px 0px;
  font-size: 12px;
  text-align: center;
}

.confirmation-container button {
  margin-top: 10px;
}
</style>
