(function() {
    var Director = require('../models/director.js');

    //Class definition
    function DirectorController(dataAccessLayer) {
        this.dal = dataAccessLayer;
    };

    //public functions
    DirectorController.prototype.createDirector = function(director, connection, callback) {
        //TODO assert director is of type Director
        var self = this;
        //Check to see if an account already exists for that director.
        self.dal.getDirector(director.getLivestreamId(), connection, function(error, result) {
            if(error) {
                callback(error);
            } else if(result.length > 0) {
                //Send back error if a director account already exists.
                callback('A director already exists with that livestreamId');
            } else {                
                //Otherwise create the director and add his auth token to the database.
                self.dal.createDirector(director, connection, function(err, result) {
                    if(err) return callback(err);
                    self.dal.createDirectorAuthToken(director, connection, callback);
                });
            }
        });
    };

    DirectorController.prototype.updateDirector = function(token, favoriteCamera, favoriteMovies, connection, callback) {
        var self = this;
        self.dal.getDirectorAuthToken(token, connection, function(err, result) {
            if(err) return callback(err);
            //else if(result.livestreamId !== director.getLivestreamId()) return callback('You are not authorized to modify that account.');
            var director = new Director(result.livestreamId, null, favoriteCamera, favoriteMovies);
            self.dal.updateDirector(director, connection, function(err, result) {
                if(err) return callback(err);
                self.dal.getDirector(director.getLivestreamId(), connection, callback);
            });
        });
    };

    DirectorController.prototype.getDirectors = function(connection, callback) {
        //TODO assert director is of type Director
        var self = this;
        self.dal.getAllDirectors(connection, callback);
    };

    module.exports = DirectorController;
})();