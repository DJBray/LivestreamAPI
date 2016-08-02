/**
 * dataAccessLayer.js
 * 
 * Provides functions to perform queries/inserts/updates on the database
 */

var crypto = require('crypto');

/**
 * Constructor
 */
function DataAccessLayer() {}

/**
 * getAllDirectors
 * 
 * Queries the database for all the directors.
 * 
 * @param connection - The database connection to use for the query
 * @param function(err, results) callback - The callback function to use for this query
 */
DataAccessLayer.prototype.getAllDirectors = function(connection, callback) {
    var query = 'SELECT livestream_id, full_name, favorite_camera, favorite_movies FROM directors;';
    connection.query(query, function(err, results) {
        if(err) return callback(err);
        callback(null, results);
    });
};

/**
 * getDirector
 * 
 * Queries the database for the director with the matching livestreamId
 * 
 * @param connection - The database connection to use for the query
 * @param function(err, results) callback - The callback function to use for this query
 */
DataAccessLayer.prototype.getDirector = function(livestreamId, connection, callback) {
    var findAccQuery = 'SELECT livestream_id, full_name, favorite_camera, favorite_movies FROM directors WHERE livestream_id = ?;';
    connection.query(findAccQuery, livestreamId, function(error, results) {
        callback(error, results);
    });
};

/**
 * createDirector
 * 
 * Precondition: There is no directors with the same livestream_id in the DB.
 * 
 * Inserts a new director into the database. Only accepts livestream_id and full_name
 * since those are the only two fields returned from livestream's API.
 * 
 * @param Director directorObj - The Director to be inserted into the db.
 * @param connection - The database connection to use for the query
 * @param function(err, results) callback - The callback function to use for this query
 */
DataAccessLayer.prototype.createDirector = function(directorObj, connection, callback) {
    var directorInsert = 'INSERT INTO directors(livestream_id, full_name) VALUES (?,?);';
    connection.query(directorInsert, [directorObj.getLivestreamId(), directorObj.getFullName()], function(error, results) {
        if(error) return callback(error);
        callback(null, directorObj);
    });
};

/**
 * updateDirector
 * 
 * Precondition: No two directors have the same livestream_id
 * 
 * Updates the director's favorite_camera and favorite_movies with the matching livestream_id.
 * 
 * @param Director directorObj - The Director object that is being updated in the database.
 * @param connection - The database connection to use for the query
 * @param function(err, results) callback - The callback function to use for this query
 */
DataAccessLayer.prototype.updateDirector = function(directorObj, connection, callback) {
    var directorUpdate = 'UPDATE directors SET favorite_camera = ?, favorite_movies = ? WHERE livestream_id = ?;';
    connection.query(directorUpdate, [directorObj.getFavoriteCamera(), directorObj.getFavoriteMovies(), directorObj.getLivestreamId()], 
        function(error, results) {
            if(error) return callback(error);
            callback(null, directorObj);
        }
    );
};

/**
 * getDirectorAuthToken
 * 
 * Queries the database for the director with the matching auth token and return's that
 * director's livestream_id.
 * 
 * @param String token - The token to match in the database.
 * @param connection - The database connection to use for the query
 * @param function(err, results) callback - The callback function to use for this query
 */
DataAccessLayer.prototype.getDirectorAuthToken = function(token, connection, callback) {
    var getAuthTokenQuery = 'SELECT livestream_id as livestreamId FROM authorization WHERE token = ?';
    connection.query(getAuthTokenQuery, token, function(err, results) {
        if(err) return callback(err);
        else if(results.length == 0) return callback(new Error('You are not authorized to use this service.'));
        else if(results.length > 1) return callback(new Error('Internal error occurred, violation of database integrity'));
        callback(null, results[0]);
    });
};

/**
 * createDirectorAuthToken
 * 
 * Precondition: No entry exists with the same livestream_id
 * 
 * Computes the md5 of a director's full_name to form that user's token.
 * The token and the director's livestream_id is then added into the database.
 * 
 * @param Director directorObj - The Director to be used to add a new auth entry.
 * @param connection - The database connection to use for the query
 * @param function(err, results) callback - The callback function to use for this query
 */
DataAccessLayer.prototype.createDirectorAuthToken = function(directorObj, connection, callback) {
    var hash = crypto.createHash('md5').update(directorObj.getFullName()).digest('hex');
    var authQuery = 'INSERT INTO authorization(livestream_id, token) VALUES(?,?);';
    connection.query(authQuery, [directorObj.getLivestreamId(), hash], function(error, results) {
        callback(error, results);
    });
};

module.exports = DataAccessLayer;