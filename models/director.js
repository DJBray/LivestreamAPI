(function() {
    function Director(livestreamId, fullName, favoriteCamera, favoriteMovies) {
        this.livestreamId = livestreamId;
        this.fullName = fullName;
        this.favoriteCamera = favoriteCamera;
        this.favoriteMovies = favoriteMovies;
    };

    Director.prototype.getLivestreamId = function() {
        return this.livestreamId;
    };

    Director.prototype.getFullName = function() {
        return this.fullName;
    };

    Director.prototype.getFavoriteCamera = function() {
        return this.favoriteCamera;
    };

    Director.prototype.getFavoriteMovies = function() {
        return this.favoriteMovies;
    };

    Director.prototype.setFavoriteCamera = function(favoriteCamera) {
        this.favoriteCamera = favoriteCamera;
    };

    Director.prototype.setFavoriteMovies = function(favoriteMovies) {
        this.favoriteMovies = favoriteMovies;
    };

    module.exports = Director;
})();