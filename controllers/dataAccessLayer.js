(function() {
    var crypto = require('crypto');

    function DataAccessLayer() {}

    DataAccessLayer.prototype.getAllDirectors = function(connection, callback) {
        var query = 'SELECT livestream_id, full_name, favorite_camera, favorite_movies FROM directors;';
        connection.query(query, function(err, results) {
            if(err) return callback(err);
            callback(null, results);
        });
    };

    DataAccessLayer.prototype.getDirector = function(livestreamId, connection, callback) {
        var findAccQuery = 'SELECT livestream_id, full_name, favorite_camera, favorite_movies FROM directors WHERE livestream_id = ?;';
        connection.query(findAccQuery, livestreamId, function(error, results) {
            callback(error, results);
        });
    };

    DataAccessLayer.prototype.createDirector = function(directorObj, connection, callback) {
        var directorInsert = 'INSERT INTO directors(livestream_id, full_name) VALUES (?,?);';
        connection.query(directorInsert, [directorObj.getLivestreamId(), directorObj.getFullName()], function(error, results) {
            callback(error, results);
        });
    };

    DataAccessLayer.prototype.updateDirector = function(directorObj, connection, callback) {
        var directorUpdate = 'UPDATE directors SET favorite_camera = ?, favorite_movies = ? WHERE livestream_id = ?;';
        connection.query(directorUpdate, [directorObj.getFavoriteCamera(), 
                                          directorObj.getFavoriteMovies(),
                                          directorObj.getLivestreamId()], callback);
    };


    DataAccessLayer.prototype.getDirectorAuthToken = function(token, connection, callback) {
        var getAuthTokenQuery = 'SELECT livestream_id as livestreamId FROM authorization WHERE token = ?';
        connection.query(getAuthTokenQuery, token, function(err, results) {
            if(err) return callback(err);
            else if(results.length == 0) return callback('You are not authorized to use this service.');
            else if(results.length > 1) return callback('Internal error occurred, violation of database integrity');
            callback(null, results[0]); //TODO only send one result.
        });
    };

    DataAccessLayer.prototype.createDirectorAuthToken = function(directorObj, connection, callback) {
        var hash = crypto.createHash('md5').update(directorObj.getFullName()).digest('hex');
        var authQuery = 'INSERT INTO authorization(livestream_id, token) VALUES(?,?);';
        connection.query(authQuery, [directorObj.getLivestreamId(), hash], function(error, results) {
            callback(error, results);
        });
    };

    module.exports = DataAccessLayer;
})();