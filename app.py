from flask import Flask, request, render_template, redirect, url_for, jsonify
import os
import random
import sqlite3
app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = 'static/recordings'
app.config['TEXT_FOLDER'] = 'kaktus'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_db_connection():
    conn = sqlite3.connect('data.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            age_group TEXT,
            gender TEXT,
            region TEXT,
            file_path TEXT,
            text TEXT
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit_user_data():
    if request.method == 'POST':
        age_group = request.form['age']
        gender = request.form['gender']
        region = request.form['region']

        conn = get_db_connection()
        conn.execute('INSERT INTO recordings (age_group, gender, region) VALUES (?, ?, ?)', 
                     (age_group, gender, region))
        conn.commit()
        conn.close()

        return redirect(url_for('record'))

@app.route('/record', methods=['GET', 'POST'])
def record():
    if request.method == 'POST':
        # Обработка аудиофайлаa
        file = request.files['audio_data']
        if file:
            # name daiu
            filename = f"recording_{random.randint(1000, 9999)}.wav"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)

            text = request.form.get('sentence')

            conn = get_db_connection()
            conn.execute('UPDATE recordings SET file_path = ?, text = ? WHERE id = (SELECT MAX(id) FROM recordings)', 
                         (file_path, text))
            conn.commit()
            conn.close()

            return 'Файл успешно загружен и сохранен в базе данных!'

    return render_template('record.html')

@app.route('/random_sentence', methods=['GET'])
def random_sentence():
    txt_files = [f for f in os.listdir(app.config['TEXT_FOLDER']) if f.endswith('.txt')]
    
    if not txt_files:
        return jsonify({"sentence": "No text files found in the folder."})

    random_file = random.choice(txt_files)
    file_path = os.path.join(app.config['TEXT_FOLDER'], random_file)

    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    return jsonify({"sentence": file_content})

if __name__ == '__main__':
    init_db()  
    app.run(debug=True)
