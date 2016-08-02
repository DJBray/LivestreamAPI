/**
 * mockDAL.js
 * 
 * Provides a mock of the DataAccessLayer so we can perform effective unit testing on
 * the directorController without actually adding entries to the database.
 */

var crypto = require('crypto');

function MockDAL(){
    this.data = [
        {
            livestream_id: 123,
            full_name: "John Smith",
            favorite_camera: "The one on the iphone",
            favorite_movies: "Pokemon 2000, Star Wars, Troy"
        },
        {
            livestream_id: 124,
            full_name: "Smithy Johnson",
            favorite_camera: "I wish I actually knew cameras",
            favorite_movies: null
        }
    ];
};

MockDAL.prototype.getData = function() {
    return this.data;
};

MockDAL.prototype.getAllDirectors = function(connection, callback) {
    callback(null, this.data);
};

MockDAL.prototype.getDirector = function(livestreamId, connection, callback) {
    callback(null, this.data.filter(t => t.livestream_id === livestreamId));
};

MockDAL.prototype.createDirector = function(directorObj, connection, callback) {
    var obj = {
        livestream_id: directorObj.getLivestreamId(),
        full_name: directorObj.getFullName(),
        favorite_camera: directorObj.getFavoriteCamera(),
        favorite_movies: directorObj.getFavoriteMovies()
    };
    this.data.push(obj);
    callback(null, directorObj);
};

MockDAL.prototype.updateDirector = function(directorObj, connection, callback) {
    var index = this.data.map(t => t.livestream_id).indexOf(directorObj.getLivestreamId());
    if(index !== -1) {
        this.data[index].favorite_camera = directorObj.getFavoriteCamera();
        this.data[index].favorite_movies = directorObj.getFavoriteMovies();
    }
    callback(null, directorObj);
};

MockDAL.prototype.getDirectorAuthToken = function(livestreamId, token, connection, callback) {
    var list = this.data.filter(t => t.livestream_id === livestreamId);
    if(list.length > 1) return callback("error: more than one with same token");
    else if(list.length == 0) return callback("error: no token found");
    var hash = crypto.createHash('md5').update(list[0].full_name).digest('hex');
    if(hash !== token) return callback('error: token doesn\'t match account');
    callback(null, { livestreamId: list[0].livestream_id, fullName: list[0].full_name });
};

module.exports = MockDAL;