document.getElementById('user-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Collect form data
    let formData = new FormData(this);

    // Send from one endpoint to other
    fetch('/submit_user_data', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        document.getElementById('user-form').style.display = 'none';
        document.getElementById('instruction').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
});

document.getElementById('start-recording').addEventListener('click', function() {
    document.getElementById('instruction').style.display = 'none';
    document.getElementById('recording-section').style.display = 'block';
    startRecording();
});

let currentRecording = 0;
const maxRecordings = 10;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;

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
                updateProgress();
                loadRandomSentence();
            };

            document.getElementById('record-btn').addEventListener('click', () => {
                if (mediaRecorder.state === 'inactive') {
                    mediaRecorder.start();
                    document.getElementById('record-btn').textContent = "Остановить запись";
                    isRecording = true;
                    drawCircle();
                } else {
                    mediaRecorder.stop();
                    document.getElementById('record-btn').textContent = "Записать";
                    isRecording = false;
                    drawCircle();
                }
            });

            drawCircle();
        })
        .catch(error => console.error('Ошибка доступа к микрофону: ', error));
}

function drawCircle() {
    const canvas = document.getElementById('voice-indicator');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = isRecording ? 'green' : 'red';
    ctx.beginPath();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 40;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
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

function updateProgress() {
    currentRecording++;
    const progressPercent = (currentRecording / maxRecordings) * 100;
    document.querySelector('.progress-bar').style.width = progressPercent + '%';
    document.getElementById('progress-text').innerText = `Записано: ${currentRecording} из ${maxRecordings}`;

    if (currentRecording >= maxRecordings) {
        alert("Все записи завершены!");
        document.getElementById('recording-section').style.display = 'none';
    }
}

window.onload = function() {
    loadRandomSentence();
    drawCircle();
};
