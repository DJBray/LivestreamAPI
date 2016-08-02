//Import 3rd party modules
var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var mysql = require('mysql');

//Import custom classes
var LivestreamController = require('./controllers/livestreamController.js');
var DirectorController = require('./controllers/directorController');
var Director = require('./models/director.js');
var DataAccessLayer = require('./controllers/dataAccessLayer.js');

//Create instantiations
var livestreamController = new LivestreamController();
var directorController = new DirectorController(new DataAccessLayer());

//In a production environment we would securely store these credentials
//in a separate file and keep it out of git but we're not going to do that
//here due to time constraints.
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'server',
    password        : 'jsodfiBE83nSOlq0)jwn3(wjd8&3j39Mbo1&j3k48dmdb29dn)',
    database        : 'LiveStreamAPI'
});

//Begin API
var app = express();

app.use(bodyParser.json());     //JSON-encoded bodies
app.use(bodyParser.urlencoded({ //URL-encoded bodies
    extended: true
}));

//requires: livestream_id (long?)
//1. Check db to see if user already exists, if so return error
//2. Else do GET to https://api.new.livestream.com/accounts/:livestream_id
//3. Read response to get full_name, favorite_camera, and favorite_movies
//4. Write to db
//5. Write back resposne with id, name, camera, and movies
app.post('/directors', function(req, res, next) {
    //Get the id from request body.
    var id = parseInt(req.body.livestream_id);

    //Assert the id is a valid livestream_id
    if(!isNaN(id) && id == req.body.livestream_id && id > 0) {
        livestreamController.getAsJSON(id, function(err, status, data) {
            if(err) return next(err);
            else if(status === 404) return next("Livestream account not found.");

            //Livestream's API verified the user's account
            console.log("Success: " + status);
            console.log("id: " + data.id);
            console.log("full_name:" + data.full_name);

            //Establish db connection
            pool.getConnection(function(err, connection) {
                if(err) {
                    connection.release;
                    return next(err);
                }

                //Create director model from Livestream's API data and attempt to create a new director account
                var director = new Director(data.id, data.full_name, null, null);
                directorController.createDirector(director, connection, function(err, result) {
                    connection.release;
                    if(err) return next(err);
                    res.send(director);
                });
            });
        });
    } else {
        //Error case
        next('A valid livestream_id was not provided.');
    }
});

//requires-header: Authorization: Bearer md5(fullNameOfAccountToModify)
//1. allow change for favorite_camera and/or favorite_movies
//2. save to db
//3. return model containing id, full_name, favorite_camera, and favorite_movies
app.put('/directors', function(req, res, next) {
    var favoriteCamera = req.body.favorite_camera;
    var favoriteMovies = req.body.favorite_movies;

    //Verify we have an authorization header and it contains a valid formatted token.
    var bearer = req.get('Authorization');
    if(bearer != null && bearer != undefined) {
        var split = bearer.split(" ");
        if(split.length === 2 && split[0] === "Bearer" && split[1] !== '') {

            //Establish db connection    
            pool.getConnection(function(err, connection) {
                if(err) {
                    connection.release();
                    return next(err);
                }

                directorController.updateDirector(split[1], favoriteCamera, favoriteMovies, connection, function(err, director) {
                    connection.release();
                    if(err) return next(err);
                    res.send(director);
                });
            });
        } else {
            next('You are not authorized to use this service');
        }
    } else {
        next('You are not authorized to use this service');
    }
});

// list all the directors registered and provide 
//full_name, favorite_camera, and favorite_movies
app.get('/directors', function(req, res, next) {
    //Establish db connection
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            return next(err);
        }

        //Get all the directors
        directorController.getDirectors(pool, function(err, directors) {
            connection.release();
            if(err) next(err);
            res.send(directors);
        });
    });
});

app.use(function(err, req, res, next) {
    //TODO make better error handling
    console.error(err);
    res.status(500).send(err);
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000');
});

