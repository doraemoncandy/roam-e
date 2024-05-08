const { createApp, ref } = Vue

createApp({
    setup() {
        const message = ref('Hello vue!')
        let promptInput = ref('');
        let answerArr = ref([]);
        let currentTxtNeed2Speech;




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
            // txt2Speech
            txt2Speech(data);
        }

        const getReversedAnswerArr =  () => {
            return answerArr.value.slice().reverse();
        }

        // txt2Speech
        const txt2Speech = async (text) => {
            // post request to the backend
            let _txt = text;
            const apiTxt2Speech = `${apiHost}t2s`;
            await axios.post(apiTxt2Speech, {
                text: _txt
            })
            return;
            // const data = response.data.response;
            // console.log('txt2Speech data',data)
        } //end: txt2Speech

        

        return {
            message,
            onClickGenerate,
            promptInput,
            answerArr,
            getReversedAnswerArr,
        }
    }
}).mount('#app')