
CREATE DATABASE voice_data_collection;


USE voice_data_collection;


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    age_group VARCHAR(50),
    gender VARCHAR(10),
    region VARCHAR(50)
);


CREATE TABLE recordings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    file_path VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
