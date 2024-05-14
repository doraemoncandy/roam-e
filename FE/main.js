const { createApp, ref } = Vue


createApp({
    setup() {

        


        
        const message = ref('Hello vue!')
        let promptInput = ref('');
        let answerArr = ref([]);
        let currentTxtNeed2Speech;
        let imgData;
        let imgURL = ref('');
        let uploadImgFile = ref(null);
        let isIsHasImg = ref(false); // 是不是有上傳圖
        let isInMic = ref(false); // 是不是在使用麥克風

        //#region init setting

        /**
         * Current Setting
         */

        let settings = {
            location: '北投捷運站', // current location
            destination: '阿芳越南食', // destination
            setting:{
                init: `我是一個70歲的老人，叫佐佐木爺爺，我很喜歡花花草草，也喜歡種樹，喜歡一些異國料理，EX:越南料理的越南河粉`,
                resstaurant: `推薦餐廳時請給我3家，用列點的方式說明店名、評價、走路距離，我會有興趣的菜色1-3道，每項不超過3字`,
                ps: `上述這些設定，在回答時都不需要覆述一遍，只需要在需要時符合需求即可。`
            }
            
        } // end: settings
        let isFirstSetting = false; // 是否第一次設定Prompt



        //#endregion init setting
        




        /**
         * API CONFIG
         */

        //#region API CONFIG
        let apiHost = 'http://localhost:3000/'
        const apiPromptChat = `${apiHost}generate`;
        const apiUploadImg = `${apiHost}generateImg`;

        //#endregion API CONFIG


        //#region popup
        
        let isOpenPopup = ref(false);


        function openFAB(event) {
            if (event) event.preventDefault();
            isOpenPopup.value = true;
        }

        function closeFAB(event) {
            if (event) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
            isOpenPopup.value = false;

        } 

        //#endregion popup

        //#region handleText
        const handleText = (text) => {
            console.log('handleText',text)
            // 處理data 去掉所有文字中 # 和 *  符號
            text = text.replace(/#/g, '');
            text = text.replace(/\*/g, '');
            // 去掉所有html tag
            text = text.replace(/<[^>]*>/g, '');

            return text;
        }
        //#endregion handleText

        //#region  map
        let initMap = () => {
            const directionsService = new google.maps.DirectionsService();

            const request = {
                origin: settings.location, // 現在位置
                destination: settings.destination,
                travelMode: 'WALKING'
            };

            return directionsService.route(request, (result, status) => {
            if (status === 'OK') {
                const route = result.routes;
                console.log('route',route)
                return route;
            } else {
                console.error('Directions request failed due to ' + status);
                // Display the route on the map.
            }
            });
        }
        //#endregion map



        const onClickGenerate = async () => {
            // post request to the backend
            answerArr.value.push({
                prompt: promptInput.value,
                answer: 'loading'
            })

            let currentIndex = answerArr.value.length - 1;

            // check if 選擇地點
            const keywordsSelect = ['選擇', '我要選', '我選擇', , '我選']; 

            if (keywordsSelect.some(keyword => promptInput.value.includes(keyword))) {
            // The prompt includes a selection keyword
            // Your code here...
            }


            // check if ask '怎麼去'
            const keywordsGo = ['怎麼去', '怎麼走'];

            if (keywordsGo.some(keyword => promptInput.value.includes(keyword))) {
                // go google map api 
                console.log('go google map api');
                let resp = await initMap();
                console.log('resp',resp)
                let totalWay = resp.routes.length;
                let wayDetail = '';

                for(let i = 0; i < resp.routes.length; i++){
                    wayDetail += `路徑${i+1}：`;
                    let route = resp.routes[i];
                    let legs = route.legs;

                    let distance = 0;
                    let duration = 0;
                    for(let j = 0; j < legs.length; j++){
                        let leg = legs[j];
                        distance  += leg.distance.value;
                        duration += leg.duration.value;

                        // all steps 
                        let instruction = '';
                        for(let k = 0; k < leg.steps.length; k++){
                            let step = leg.steps[k];
                            // 去掉所有html tag
                            let _currentInstruction = handleText(step.instructions);
                            instruction +=  `第${k+1}步：${_currentInstruction}。`;
                        }
                        // 時間四捨五入到分鐘
                        // 距離四捨五入到公里
                        wayDetail += `花費約：${ Math.round(duration/60)}分鐘，距離：${distance/1000}公里，${instruction}   \n${instruction}`;

                    } //end: for legs
                } //end: for routes


                // 路徑設定優化方式
                let waySolution = `我查了Google MAP${promptInput.value}，總共有${totalWay}條路徑，每條路徑的資訊如下：${wayDetail}，
                我是一個70歲的老人，你可以用親民一點的方式，幫我歸納這些資訊，希望你可以最彙整的時候，達到以下要求，
                1. 用列點整理出來最適合的路徑 2.說明每種路徑大概要走多久 3.路徑走法希望可以用簡單好懂的方式告訴我 4.最後，希望你能提醒我路上該注意什麼 5.請不要講得太複雜字太多，用50字完成所有要求 `;
                
                console.log('waySolution',waySolution)
                const response = await axios.post(apiPromptChat, {
                    // Your request body goes here
                    prompt: waySolution
                })
                const data = handleText(response.data);
                answerArr.value[currentIndex].answer = data;
                // txt2Speech
                txt2Speech(data);

            }
            else{
                // normal chat
                

                // check if isHasImg
                if(isIsHasImg.value){
                    // 將 base64 格式的影像上傳到後端
                    
                    // request need formData
                    console.log('post imgData',imgData)
                    // 改filename 為 img 給後端用
                    imgData.filename = 'img';
                    const formData = new FormData();
                
                    formData.append('img', imgData);
                    formData.append('prompt', promptInput.value);

                    // Log FormData entries
                    for (let [key, value] of formData.entries()) {
                        console.log(key, value);
                    }

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
                    let _inputTxt = ''
                    if(!isFirstSetting){
                        _inputTxt = `${settings.setting.init}。${settings.setting.resstaurant}。${settings.setting.ps}。${promptInput.value}`;
                    }
                    else{
                        _inputTxt = `${promptInput.value}`;
                    }
                    
                    const response = await axios.post(apiPromptChat, {
                        // Your request body goes here
                        prompt: _inputTxt
                    })
                    const data = handleText(response.data);
                    answerArr.value[currentIndex].answer = data;
                    // txt2Speech
                    txt2Speech(data);

                } //end: else
            } //end: else if 怎麼去
            promptInput.value = '';
            
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
            
            const img = document.createElement('img');
            img.src = canvas[0].toDataURL('image/png');
            imgURL.value = img.src;
            // 將img.src 轉為 File object
            const file = await fetch(img.src).then(res => res.blob());
            // 幫File 給 filename
            file.filename = 'img';
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
            isInMic.value = true;

            recognition.onresult = function(event) {
                const speech = event.results[0][0].transcript;
                promptInput.value += speech;
                isInMic.value = false;
                
            };  

            recognition.onerror = function(event) {
                console.log('Error occurred in recognition: ' + event.error);
                isInMic.value = false;
            };
        }

        //#endregion open mic

        //#region upload Image 
        let uploadImgChange = (e) => {
            console.log('uploadImgChange',e)
            console.log('uploadImgFile',uploadImgFile.value)
            const file = e.target.files[0];
            
            console.log('file', file)
            if(file){
                imgURL.value = URL.createObjectURL(file);
                isIsHasImg.value = true;
                console.log('preview imgURL',imgURL.value)
                imgData = file; // for api post img data
            }
            else{
                imgURL.value = '';
                isIsHasImg.value = false;
                // imgData = null;
            }
            // get file and show on html preview

        }
        //#endregion upload Image

        

        

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
            openMic,
            isInMic,
            imgData,
            clearImage,
            isIsHasImg,
            imgURL,
            uploadImgFile,
            uploadImgChange,
        }
    }
}).mount('#app')