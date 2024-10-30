from flask import Flask, request, render_template, jsonify, redirect, url_for
import os
import random
import sqlite3
import re

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = 'static/recordings'
app.config['TEXT_FOLDER'] = 'kaktus'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Counting from user 1 
user_counter = 1

def get_db_connection():
    try:
        conn = sqlite3.connect('data.db')
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None


def init_db():
    conn = get_db_connection()
    print("Creating DB")
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            age TEXT NOT NULL,
            gender TEXT NOT NULL,
            region TEXT NOT NULL
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
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
    print("Did that render index")
    return render_template('index.html')

@app.route('/submit_user_data', methods=['POST'])
def submit_user_data():
    print("Submit user data route reached.")
    if request.method == 'POST':
        age = request.form.get('age')
        gender = request.form.get('gender')
        region = request.form.get('region')

        # Test for DB
        print(f"Received data: Age={age}, Gender={gender}, Region={region}")

        # Save the data to the database
        conn = get_db_connection()
        if conn is None:
            return "Database connection error", 500

        try:
            conn.execute(
                'INSERT INTO users (age, gender, region) VALUES (?, ?, ?)', 
                (age, gender, region)
            )
            conn.commit()
            print('Data Inserted GOOD!!!!!')
            return redirect(url_for('index'))
        except Exception as e:
            print(f"Error saving user data: {e}")
            return "Error saving data", 500
        finally:
            conn.close()

    return "Invalid request method", 405



# THIS PART is not necessary 
# @app.route('/record', methods=['GET', 'POST'])
# def record():
#     if request.method == 'POST':
#         file = request.files['audio_data']
#         if file:
#             filename = f"recording_{random.randint(1000, 9999)}.wav"
#             file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#             file.save(file_path)

#             text = request.form.get('sentence')

#             conn = get_db_connection()
#             conn.execute('UPDATE recordings SET file_path = ?, text = ? WHERE id = (SELECT MAX(id) FROM recordings)', 
#                          (file_path, text))
#             conn.commit()
#             conn.close()

#             return 'Файл успешно загружен и сохранен в базе данных!'

    # return render_template('record.html')

@app.route('/random_sentence', methods=['GET'])
def random_sentence():
    txt_files = [f for f in os.listdir(app.config['TEXT_FOLDER']) if f.endswith('.txt')]
    
    if not txt_files:
        return jsonify({"sentence": "No text files found in the folder."})

    random_file = random.choice(txt_files)
    file_path = os.path.join(app.config['TEXT_FOLDER'], random_file)

    with open(file_path, 'r', encoding='utf-8') as file:
        file_content = file.read()

    sentences = re.split(r'(?<=[.!?])\s+', file_content)

    first_two_sentences = ' '.join(sentences[:1])

    return jsonify({"sentence": first_two_sentences})

if __name__ == '__main__':
    init_db()  # Ensures database is initialized on startup
    app.run(debug=True)

