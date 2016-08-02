/**
 * app.js
 * 
 * Main file for this application. Defines endpoints for creating, updating, 
 * and getting directors and their favorite movies and/or camera.
 */

//Import 3rd party modules
var express = require('express');
var bodyParser = require('body-parser');
var crypto = require('crypto');
var mysql = require('mysql');
var morgan = require('morgan');

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

app.use(morgan('combined'));    //Logger
app.use(bodyParser.json());     //JSON-encoded bodies
app.use(bodyParser.urlencoded({ //URL-encoded bodies
    extended: true
}));

/**
 * POST /directors
 * 
 * Creates a new director entry using the livestream_id. This endpoint 
 * connects with livestream to validate the id is valid, gets the full_name, 
 * and then creates a new Director object and saves it to the database. 
 * If an account already exists with that livestream_id an error will be thrown.
 * 
 * @bodyparam int livestream_id - The id of the livestream account to connect with.
 * @return Director - The director entry that was stored in the database
 */
app.post('/directors', function(req, res, next) {
    //Get the id from request body.
    var id = parseInt(req.body.livestream_id);

    //Assert the id is a valid livestream_id
    if(id === undefined || isNaN(id) || id != req.body.livestream_id || id < 0) {
        res.status(400);
        return next(new Error('A valid livestream_id was not provided.'));
    }

    livestreamController.getAsJSON(id, function(err, status, data) {
        if(err) {
            res.status(500);
            return next(err);
        } else if(status >= 400) {
            res.status(status);
            return next(data);
        }

        //Establish db connection
        pool.getConnection(function(err, connection) {
            if(err) {
                connection.release;
                res.status(500);
                return next(err);
            }

            //Create director model from Livestream's API data and attempt to create a new director account
            var director = new Director(data.id, data.full_name, null, null);
            directorController.createDirector(director, connection, function(err, result) {
                connection.release;
                if(err) {
                    res.status(400);
                    return next(err);
                }
                res.send(director);
            });
        });
    });
});

/**
 * PUT /directors
 * 
 * Updates an existing director in the database to update favorite_camera and favorite_movies.
 * This endpoint requires an authorization token to be sent by the client in order to 
 * find the director entry to update.
 * 
 * @header Authorization: Bearer md5(full_name)
 * @bodyparam String favorite_camera - the updated favorite camera value
 * @bodyparam String favorite_movies - the updated favorite movies.
 * @return Director - The updated director entry.
 */
app.put('/directors', function(req, res, next) {
    var favoriteCamera = req.body.favorite_camera;
    var favoriteMovies = req.body.favorite_movies;
    if(favoriteCamera === undefined || favoriteMovies === undefined) {
        res.status(400);
        return next(new Error('favorite_camera and favorite_movies must both be provided'));
    }

    //Verify we have an authorization header and it contains a valid formatted token.
    var bearer = req.get('Authorization');
    if(bearer === null || bearer === undefined) {
        res.status(401);
        return next(new Error('You are not authorized to use this service'));
    }
    
    var split = bearer.split(" ");
    if(split.length !== 2 || split[0] !== "Bearer" || split[1] === '') {
        res.status(401);
        return next(new Error('You are not authorized to use this service'));
    }

    //Establish db connection    
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            res.status(500);
            return next(err);
        }

        //Update director object
        directorController.updateDirector(split[1], favoriteCamera, favoriteMovies, connection, function(err, director) {
            connection.release();
            if(err) {
                res.status(500);
                return next(err);
            }
            res.send(director);
        });
    });
});

/**
 * GET /directors
 * 
 * Gets a list of all the director entries in the database. Each
 * director is returned with livestream_id, full_name, favorite_camera, and favorite_movies.
 * 
 * @return Array - An array of all the directors contained in the db.
 */
app.get('/directors', function(req, res, next) {
    //Establish db connection
    pool.getConnection(function(err, connection) {
        if(err) {
            connection.release();
            res.status(500);
            return next(err);
        }

        //Get all the directors
        directorController.getDirectors(pool, function(err, directors) {
            connection.release();
            if(err) {
                res.status(500);
                next(err);
            }
            res.send(directors);
        });
    });
});

app.use(function(err, req, res, next) {
    //With more time for this project we could improve the error handling
    console.error(err);
    res.send(err.message);
});

app.listen(3000, function() {
    console.log('App listening on port 3000');
});

