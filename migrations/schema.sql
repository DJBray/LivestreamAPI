CREATE DATABASE LiveStreamAPI;

CREATE USER 'server'@'localhost' IDENTIFIED BY 'jsodfiBE83nSOlq0)jwn3(wjd8&3j39Mbo1&j3k48dmdb29dn)';
GRANT INSERT, UPDATE, DELETE, SELECT ON LiveStreamAPI.* TO 'server'@'localhost';

CREATE TABLE LiveStreamAPI.directors (
    livestream_id INT NOT NULL,
    full_name VARCHAR(50) NOT NULL,
    favorite_camera VARCHAR(100),
    favorite_movies VARCHAR(5000),

    PRIMARY KEY(livestream_id)
) ENGINE=InnoDB;

CREATE TABLE LiveStreamAPI.authorization (
    livestream_id INT NOT NULL,
    token VARCHAR(200) NOT NULL,

    PRIMARY KEY(livestream_id),
    FOREIGN KEY(livestream_id)
        REFERENCES LiveStreamAPI.directors(livestream_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB;