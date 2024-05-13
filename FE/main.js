const { createApp, ref } = Vue

createApp({
    setup() {
        
        const message = ref('Hello vue!')
        let promptInput = ref('');
        let answerArr = ref([]);
        let currentTxtNeed2Speech;
        let imgData;
        let imgURL = ref('');
        let isIsHasImg = ref(false); // 是不是有上傳圖
        




        /**
         * API CONFIG
         */

        //#region API CONFIG
        let apiHost = 'http://localhost:3000/'
        const apiPromptChat = `${apiHost}generate`;
        const apiUploadImg = `${apiHost}generateImg`;

        //#endregion API CONFIG


        //#region popup
        
        //Variables
        let isOpenPopup = ref(false);

        // var overlay = $("#overlay"),
        // fab = $(".fab"),
        // cancel = $("#cancel"),
        // submit = $("#submit");

        // //fab click
        // fab.on('click', openFAB);
        // overlay.on('click', closeFAB);
        // cancel.on('click', closeFAB);

        function openFAB(event) {
            if (event) event.preventDefault();
            // fab.addClass('active');
            // overlay.addClass('dark-overlay');
            isOpenPopup.value = true;
        }

        function closeFAB(event) {
            if (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            isOpenPopup.value = false;
            // fab.removeClass('active');
            // overlay.removeClass('dark-overlay');

        } 

        //#endregion popup

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
            answerArr.value.push({
                prompt: promptInput.value,
                answer: 'loading'
            })

            let currentIndex = answerArr.value.length - 1;

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
                answerArr.value[currentIndex].answer = data;
                // txt2Speech
                txt2Speech(data);

            }
            else{
                console.log('yy')
                const response = await axios.post(apiPromptChat, {
                    // Your request body goes here
                    prompt: promptInput.value
                })
                const data = handleText(response.data);
                console.log('data',data)
                answerArr.value[currentIndex].answer = data;
                // txt2Speech
                txt2Speech(data);

            } //end: else
            
        }

        const getReversedAnswerArr =  () => {
            return answerArr.value;
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
            isOpenPopup.value = true;
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
            const canvas = document.querySelectorAll('canvas');
            for(let i = 0; i < canvas.length; i++){
                canvas[i].width = video.videoWidth;
                canvas[i].height = video.videoHeight;
                canvas[i].getContext('2d').drawImage(video, 0, 0, canvas[i].width, canvas[i].height);

            }
            // canvas.width = video.videoWidth;
            // canvas.height = video.videoHeight;
            // // show image on canvas 

            // const context = canvas.getContext('2d');
            // context.drawImage(video, 0, 0,  canvas.width, canvas.height );
            
            const img = document.createElement('img');
            img.src = canvas[0].toDataURL('image/png');
            imgURL.value = img.src;
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


        //#region open mic
        const openMic = () => {
            // 創建一個 SpeechRecognition 物件
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();

            recognition.lang = 'zh-tw'; // 設定語言
            recognition.interimResults = false; // 只有當使用者停止說話後才返回結果
            recognition.maxAlternatives = 1; // 返回最多 1 個結果

            recognition.start(); // 開始識別

            recognition.onresult = function(event) {
                // 當識別結果返回時，將結果傳遞給 gemini 的 speech2txt
                const speech = event.results[0][0].transcript;

                // 傳遞結果給 gemini 的 speech2txt
                // 你需要替換這裡的 URL 和數據格式以適應你的後端
                axios.post('https://your-gemini-api/speech2txt', { speech: speech })
                    .then(function(response) {
                        console.log(response.data);
                    })
                    .catch(function(error) {
                        console.log(error);
                    });
            };

            recognition.onerror = function(event) {
                console.log('Error occurred in recognition: ' + event.error);
            };
        }

        //#endregion open mic

        

        return {
            /** popup */
            isOpenPopup,
            openFAB,
            closeFAB,
            /** popup */
            message,
            onClickGenerate,
            promptInput,
            answerArr,
            getReversedAnswerArr,
            openCamera,
            clickCapture,
            imgData,
            clearImage,
            isIsHasImg,
            imgURL
        }
    }
}).mount('#app')