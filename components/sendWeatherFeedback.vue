<template>
    <div class="send_feedback_container" @click="closePopupOutside">
      <div class="send_feedback_container_content_container" @click.stop>
        <h3 class="send_feedback_container_subtitle">
          Send to us your feels like feedback
        </h3>
        <div class="send_feedback_infos">
            <p>City: {{ weatherInfos?.location?.name }} - {{ weatherInfos?.location?.country }}</p>
            <p>Weather Feels Like: {{ weatherInfos?.current?.feelslike_c }}°C</p>
        </div>
        <div class="row_inputs_container">
            <div class="input_container">
                <label>Name:</label>
                <input maxlength="20" v-model="userName" type="text">
            </div>
            <div class="input_container">
                <label>* Feels Like (°C):</label>
                <input type="number" v-model="userFeelsLike">
            </div>

            <div class="input_container">
                <label>* Rate:</label>
                <select v-model="userRate">
                    <option value="0.5">0.5</option>
                    <option value="1.0">1.0</option>
                    <option value="1.5">1.5</option>
                    <option value="2.0">2.0</option>
                    <option value="2.5">2.5</option>
                    <option value="3.0">3.0</option>
                    <option value="3.5">3.5</option>
                    <option value="4.0">4.0</option>
                    <option value="4.5">4.5</option>
                    <option value="5.0">5.0</option>
                </select>
            </div>
        </div>
        <div class="comment_box">
            <label>Comment</label>
            <textarea maxlength="50" v-model="userComment" type="text"></textarea>
        </div>
        <span v-if="showMissingFields" class="form-alert">{{ errorMessage }}</span>
        <button v-if="!isButtonLoading" type="button" class="btn-send-feedback" @click="handleSaveFeedback">
          <small>Send feedback</small>
        </button>
        <div v-else>
            <div class="loadingSpinner"></div>
        </div>
      </div>
    </div>
</template>

<script>
export default {
    props: {
        weatherInfos: {
            default: null,
            required: false
        }
    },

    data() {
        return {
            userName: null,
            userComment: null,
            userRate: null,
            userFeelsLike: null,
            showMissingFields: false,
            isButtonLoading: false
        }

    },

    methods: {
            closePopup () {
                this.$emit('closeWeatherPopup')
            },
            updateFeedbacks() {
                this.$emit('updateFeedbacks')
            },
            closePopupOutside(event) {
                if (event.target.classList.contains('send_feedback_container') || event.target.classList.contains('send_feedback_back')) {
                    this.closePopup(); 
                }
            },
            async handleSaveFeedback() {
                this.isButtonLoading = true;
                if(!this.userRate || !this.userFeelsLike) {
                    this.showMissingFields = true;
                    this.errorMessage = "* rate and feels like input are required to create feedback"
                    this.isButtonLoading = false;
                } else {
                    this.showMissingFields = false;
                    try {
                        await this.$axios.post('http://localhost:3333/feedback', {
                            city: this.weatherInfos?.location?.name,
                            description: this.userComment, 
                            user_name: this.userName, 
                            viewed_temperature: this.weatherInfos?.current?.feelslike_c, 
                            perceived_temperature: this.userFeelsLike, 
                            rate: this.userRate,
                            lon: this.weatherInfos?.location?.lon,
                            lat: this.weatherInfos?.location?.lat
                        })
                        this.isButtonLoading = false
                        this.closePopup()
                        this.updateFeedbacks()
                    } catch (error) {
                        this.isButtonLoading = false    
                        console.log('error to create feedback')
                        this.showMissingFields = true;
                        this.errorMessage = "Error to create feedback try again later"
                    }
                }
            }
        }   
    }
</script>
  

<style>

.send_feedback_container {
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

.send_feedback_container_content_container {
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

.form-alert {
    font-family: verdana;
    align-self: flex-start;
    font-size: 16px;
    margin: 8px 0px;
    color: #E73550;
}

.send_feedback_container_back {
    margin-top: 16px;
    color: #0C70F2;
    font-family: gotham-re;
    font-size: 0.9;
    cursor: pointer;
}

.send_feedback_container_icon {
    display: none;
}

.row_inputs_container {
    margin-top: 16px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-direction: row;
}

.send_feedback_container_subtitle {
    font-family: verdana;
    font-size: 1.25rem;
    margin: 0px;
    margin-bottom: 8px;
}

.send_feedback_container_description {
    font-family: gotham-re;
    color: #303030;
    font-size: 1rem;
    line-height: 16px;
    margin-bottom: 16px;
    text-align: center;
}

.send_feedback_container_title {
    color: #000;
    font-size: 2rem;
    font-family: gotham-me;
    margin-bottom: 32px;
}

.input_container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}


.send_feedback_infos {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 16px;
}
.send_feedback_infos p{
    font-family: verdana;
    font-size: 16px
}


.input_container input {
    width: calc(100% - 22px);
    padding: 10px;
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

.input_container select {
    width: calc(100% - 22px);
    padding: 10px;
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

.input_container label {
    font-family: Verdana;
    font-size: 14px;
}

.comment_box {
    margin-top: 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

.comment_box textarea {
    padding: 10px;
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

.comment_box label {
    font-family: Verdana;
    font-size: 14px;
}

.profile_title {
    font-size: 26px;
    font-family: gotham-bo;
}

.btn-delete {
    font-family: gotham-me;
    color: #fff;
    background-color: #E73550;
    font-size: 14px;
    border-radius: 8px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.btn-delete small{
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

.profile-buttons-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 24px 0px 68px 0px;
}
.btn-send-feedback{
    background-color: #0C70F2;
    color: #fff;
    border: 1px solid #0C70F2;
    padding: 8px 16px;
    cursor: pointer;
    font-family: verdana;
    font-size: 16px;
    border-radius: 8px;
    margin-top: 16px;
}
.btn-send-feedback:hover{
    background-color: #fff;
    border: 1px solid #0C70F2;
    color: #0C70F2;
}

</style>