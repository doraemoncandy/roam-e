const { createApp, ref } = Vue

createApp({
    setup() {
        const message = ref('Hello vue!')
        let promptInput = ref('');
        let answerArr = ref([]);



        /**
         * API CONFIG
         */

        //#region API CONFIG
        let apiHost = 'http://localhost:3000/'
        let apiPromptChat = `${apiHost}generate`;

        //#endregion API CONFIG


        const onClickGenerate = async () => {
            // post request to the backend
            
            const response = await axios.post(apiPromptChat, {
                // Your request body goes here
                prompt: promptInput.value
            })
            const data = response.data.response;
            console.log('data',data)
            answerArr.value.push({
                prompt: promptInput.value,
                answer: data
            })
        }

        const getReversedAnswerArr =  () => {
            return answerArr.value.slice().reverse();
        }
        return {
            message,
            onClickGenerate,
            promptInput,
            answerArr,
            getReversedAnswerArr,
        }
    }
}).mount('#app')