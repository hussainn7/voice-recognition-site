document.getElementById('user-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    document.getElementById('user-form').style.display = 'none';
    document.getElementById('instruction').style.display = 'block';

    document.getElementById('change-sentence-btn').addEventListener('click', function() {
        loadRandomSentence();
    });
});

document.getElementById('start-recording').addEventListener('click', function() {
    document.getElementById('instruction').style.display = 'none';
    document.getElementById('recording-section').style.display = 'block';
    
    startRecording();
});

let mediaRecorder;
let audioChunks = [];

function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; 

            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = function() {
                saveAudio(); 
            };

            document.getElementById('record-btn').addEventListener('click', () => {
                if (mediaRecorder.state === 'inactive') {
                    mediaRecorder.start();
                    document.getElementById('record-btn').textContent = "Остановить запись";
                } else {
                    mediaRecorder.stop();
                    document.getElementById('record-btn').textContent = "Записать";
                }
            });
        })
        .catch(error => console.error('Ошибка доступа к микрофону: ', error));
}


function saveAudio() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

    const formData = new FormData();
    formData.append('audio_data', audioBlob, 'recording.wav');

    const sentenceText = document.getElementById('sentence').innerText;
    formData.append('sentence', sentenceText);
    fetch('/record', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);  
        alert("Файл успешно сохранен!");  
    })
    .catch(error => console.error('Ошибка при сохранении файла:', error));
}


function loadRandomSentence() {
    fetch('/random_sentence')
        .then(response => response.json())
        .then(data => {
            document.getElementById('sentence').innerText = data.sentence;
        })
        .catch(error => console.error('Ошибка загрузки предложения:', error));
}

window.onload = loadRandomSentence;
