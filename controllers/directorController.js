/**
 * directorController.js
 * 
 * A middleman for between the API endpoint and the database. This file
 * contains most of the business logic for dealing with directors.
 */

var Director = require('../models/director.js');

/**
 * Constructor
 * @param DataAccessLayer dataAccessLayer - the DataAccessLayer object to be used by this object.
 */
function DirectorController(dataAccessLayer) {
    this.dal = dataAccessLayer;
};

/**
 * createDirector
 * 
 * Creates a new director in the database if one doesn't already exist with 
 * that livestream id. Otherwise an error is returned.
 * 
 * @param Director director - The Director object to parse and insert into the database
 * @param connection - The database connection to use for this transaction
 * @param function(error, Director result) callback - The callback function to execute on completion or error
 */
DirectorController.prototype.createDirector = function(director, connection, callback) {
    var self = this;
    //Check to see if an account already exists for that director.
    self.dal.getDirector(director.getLivestreamId(), connection, function(error, result) {
        if(error) {
            callback(error);
        } else if(result.length > 0) {
            //Send back error if a director account already exists.
            callback(new Error('A director already exists with that livestreamId'));
        } else {                
            //Otherwise create the director and add his auth token to the database.
            self.dal.createDirector(director, connection, callback);
        }
    });
};

/**
 * updateDirector
 * 
 * Updates a director's favorite movies and favorite camera. Using the provided token,
 * a query is done on the database to find the account with the matching livestream id.
 * If an entry is not found with a matching token then the user is not authorized to
 * modify a director and an error is thrown.
 * 
 * @param int livestreamId - The livestream id of the account to update
 * @param String token - The md5(full_name) used to determine which director account to update
 * @param String favoriteCamera - The favorite camera to update
 * @param String favoriteMovies - The favorite movies to update
 * @param connection - The database connection to use for this transaction
 * @param function(error, Director result) callback - The callback function to execute on completion or error
 */
DirectorController.prototype.updateDirector = function(livestreamId, token, favoriteCamera, favoriteMovies, connection, callback) {
    var self = this;
    self.dal.getDirectorAuthToken(livestreamId, token, connection, function(err, result) {
        if(err) return callback(err);
        //else if(result.livestreamId !== director.getLivestreamId()) return callback('You are not authorized to modify that account.');
        var director = new Director(result.livestreamId, result.fullName, favoriteCamera, favoriteMovies);
        self.dal.updateDirector(director, connection, function(err, result) {
            if(err) return callback(err);
            self.dal.getDirector(director.getLivestreamId(), connection, callback);
        });
    });
};

/**
 * getDirectors
 * 
 * Returns an array of all the directors in the database. 
 * 
 * @param connection - The database connection to use for this transaction.
 * @param function(error, [Director] result) callback - The callback function to execute on completion or error
 */
DirectorController.prototype.getDirectors = function(connection, callback) {
    var self = this;
    self.dal.getAllDirectors(connection, callback);
};

module.exports = DirectorController;