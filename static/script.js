document.getElementById('user-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Скрываем форму и показываем инструкцию
    document.getElementById('user-form').style.display = 'none';
    document.getElementById('instruction').style.display = 'block';
});

// При нажатии на кнопку "Начать запись"
document.getElementById('start-recording').addEventListener('click', function() {
    document.getElementById('instruction').style.display = 'none';
    document.getElementById('recording-section').style.display = 'block';
    
    // Начинаем запись
    startRecording();
});

let mediaRecorder;
let audioChunks = [];

// Функция для начала записи
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            // Когда есть доступные аудиоданные
            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };

            // Когда запись останавливается
            mediaRecorder.onstop = function() {
                saveAudio();
            };

            // Обработчик нажатия кнопки для начала/остановки записи
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

// Функция для сохранения аудиофайла
function saveAudio() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Создаем ссылку для скачивания файла
    const downloadLink = document.createElement('a');
    downloadLink.href = audioUrl;
    downloadLink.download = 'recording.wav';
    downloadLink.textContent = 'Скачать аудиофайл';
    
    // Добавляем ссылку на страницу
    document.body.appendChild(downloadLink);
}