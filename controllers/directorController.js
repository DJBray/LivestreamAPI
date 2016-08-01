(function() {
    var crypto = require('crypto');
    var Director = require('../models/director.js');

    //Class definition
    function DirectorController() {};

    //private functions
    function getAllDirectors(connection, callback) {
        var query = 'SELECT livestream_id, full_name, favorite_camera, favorite_movies FROM directors;';
        connection.query(query, function(err, results) {
            if(err) return callback(err);
            callback(null, results);
        });
    };

    function getDirector(livestreamId, connection, callback) {
        var findAccQuery = 'SELECT livestream_id, full_name, favorite_camera, favorite_movies FROM directors WHERE livestream_id = ?;';
        connection.query(findAccQuery, livestreamId, function(error, results) {
            callback(error, results);
        });
    };

    function createDirector(directorObj, connection, callback) {
        var directorInsert = 'INSERT INTO directors(livestream_id, full_name) VALUES (?,?);';
        connection.query(directorInsert, [directorObj.getLivestreamId(), directorObj.getFullName()], function(error, results) {
            callback(error, results);
        });
    };

    function updateDirector(directorObj, connection, callback) {
        var directorUpdate = 'UPDATE directors SET favorite_camera = ?, favorite_movies = ? WHERE livestream_id = ?;';
        connection.query(directorUpdate, [directorObj.getFavoriteCamera(), 
                                          directorObj.getFavoriteMovies(),
                                          directorObj.getLivestreamId()], callback);
    };


    function getDIrectorAuthToken(token, connection, callback) {
        var getAuthTokenQuery = 'SELECT livestream_id as livestreamId FROM authorization WHERE token = ?';
        connection.query(getAuthTokenQuery, token, function(err, results) {
            if(err) return callback(err);
            else if(results.length == 0) return callback('You are not authorized to use this service.');
            else if(results.length > 1) return callback('Internal error occurred, violation of database integrity');
            callback(null, results[0]); //TODO only send one result.
        });
    };

    function createDirectorAuthToken(directorObj, connection, callback) {
        var hash = crypto.createHash('md5').update(directorObj.getFullName()).digest('hex');
        var authQuery = 'INSERT INTO authorization(livestream_id, token) VALUES(?,?);';
        connection.query(authQuery, [directorObj.getLivestreamId(), hash], function(error, results) {
            callback(error, results);
        });
    };

    //public functions
    DirectorController.prototype.createDirector = function(director, connection, callback) {
        //TODO assert director is of type Director

        //Check to see if an account already exists for that director.
        getDirector(director.getLivestreamId(), connection, function(error, result) {
            if(error) {
                callback(error);
            } else if(result.length > 0) {
                //Send back error if a director account already exists.
                callback('A director already exists with that livestreamId');
            } else {                
                //Otherwise create the director and add his auth token to the database.
                createDirector(director, connection, function(err, result) {
                    if(err) return callback(err);
                    createDirectorAuthToken(director, connection, callback);
                });
            }
        });
    };

    DirectorController.prototype.updateDirector = function(token, favoriteCamera, favoriteMovies, connection, callback) {
        //TODO assert director is of type Director
        getDIrectorAuthToken(token, connection, function(err, result) {
            if(err) return callback(err);
            //else if(result.livestreamId !== director.getLivestreamId()) return callback('You are not authorized to modify that account.');
            var director = new Director(result.livestreamId, null, favoriteCamera, favoriteMovies);
            updateDirector(director, connection, function(err, result) {
                if(err) return callback(err);
                getDirector(director.getLivestreamId(), connection, callback);
            });
        });
    };

    DirectorController.prototype.getDirectors = function(connection, callback) {
        //TODO assert director is of type Director
        getAllDirectors(connection, callback);
    };

    module.exports = DirectorController;
})();