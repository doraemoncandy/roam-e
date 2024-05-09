const { createApp, ref } = Vue

createApp({
    setup() {
        const message = ref('Hello vue!')
        let promptInput = ref('');
        let answerArr = ref([]);
        let currentTxtNeed2Speech;
        let imgData;
        let isIsHasImg = ref(false);




        /**
         * API CONFIG
         */

        //#region API CONFIG
        let apiHost = 'http://localhost:3000/'
        const apiPromptChat = `${apiHost}generate`;
        const apiUploadImg = `${apiHost}generateImg`;

        //#endregion API CONFIG

        //#region handleText
        const handleText = (text) => {
            // 處理data 去掉所有文字中 # 和 *  符號
            text = text.replace(/#/g, '');
            text = text.replace(/\*/g, '');
            return text;
        }
        //#endregion handleText


        const onClickGenerate = async () => {
            // post request to the backend

            if(isIsHasImg.value){
                // 將 base64 格式的影像上傳到後端
                
                // request need formData

                const formData = new FormData();
                formData.append('img', imgData);
                formData.append('prompt', promptInput.value);

                // 使用 FormData 物件發送請求
                const resp = await axios.post(apiUploadImg, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                let data = resp.data.candidates[0].content.parts[0].text;
                // 處理data 去掉所有文字中 # 和 *  符號
                data = handleText(data);

                console.log('data',data)
                answerArr.value.push({
                    prompt: promptInput.value,
                    answer: data
                })
                // txt2Speech
                txt2Speech(data);

            }
            else{
                const response = await axios.post(apiPromptChat, {
                    // Your request body goes here
                    prompt: promptInput.value
                })
                const data = handleText(response.data.response);
                console.log('data',data)
                answerArr.value.push({
                    prompt: promptInput.value,
                    answer: data
                })
                // txt2Speech
                txt2Speech(data);

            } //end: else
            
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

        const openCamera = async () => {
            // 檢查瀏覽器是否支援 MediaDevices API
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // 請求開啟鏡頭
                navigator.mediaDevices.getUserMedia({ video: true })
                .then(function(stream) {
                    const video = document.querySelector('video');
                    video.srcObject = stream;
                })
                .catch(function(err) {
                    console.log(err);
                });
            } else {
                console.log('Your browser does not support the MediaDevices API');
            }
        } // end: openCamera

        //#region clickCapture
        const clickCapture = async () => {
            // 擷取影像
            const video = document.querySelector('video');
            const canvas = document.querySelector('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // show image on canvas 

            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0,  canvas.width, canvas.height );
            
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            // 將img.src 轉為 File object
            const file = await fetch(img.src).then(res => res.blob());
            console.log('file',file)

            // 將擷取的影像轉成 base64 格式
            imgData = file;

            isIsHasImg.value = true;
            
        }
        //#endregion clickCapture

        //#region clearImage
        const clearImage = () => {
            isIsHasImg.value = false;
            // clean cavas content
            const canvas = document.querySelector('canvas');
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        //#endregion clearImage

        

        return {
            message,
            onClickGenerate,
            promptInput,
            answerArr,
            getReversedAnswerArr,
            openCamera,
            clickCapture,
            imgData,
            clearImage
        }
    }
}).mount('#app')