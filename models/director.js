/**
 * director.js
 * 
 * Provides a model for the director objects that are used throughout the application.
 */

/**
 * Constructor
 * @param int livestreamId - The livestream id of the director's account
 * @param String fullName - The director's full name taken from the livestream account
 * @param String favoriteCamera - The director's favorite camera
 * @param String favoriteMovies - The director's favorite movies
 */
function Director(livestreamId, fullName, favoriteCamera, favoriteMovies) {
    this.livestreamId = livestreamId;
    this.fullName = fullName;
    this.favoriteCamera = favoriteCamera;
    this.favoriteMovies = favoriteMovies;
};

/**
 * getLivestreamId
 * 
 * Gets the livestream id for this director
 * 
 * @return int - the director's livestream id
 */
Director.prototype.getLivestreamId = function() {
    return this.livestreamId;
};

/**
 * getFullName
 * 
 * Gets the full name for this director
 * 
 * @return String - the director's full name
 */
Director.prototype.getFullName = function() {
    return this.fullName;
};

/**
 * getFavoriteCamera
 * 
 * Gets the favorite camera for this director
 * 
 * @return String - the director's favorite camera
 */
Director.prototype.getFavoriteCamera = function() {
    return this.favoriteCamera;
};

/**
 * getFavoriteMovies
 * 
 * Gets the favorite movies for this director
 * 
 * @return String - the director's favorite movies
 */
Director.prototype.getFavoriteMovies = function() {
    return this.favoriteMovies;
};

/**
 * setFavoriteCamera
 * 
 * Sets the favorite camera for this director
 * 
 * @param String favoriteCamera - the director's favorite camera
 */
Director.prototype.setFavoriteCamera = function(favoriteCamera) {
    this.favoriteCamera = favoriteCamera;
};

/**
 * setFavoriteMovies
 * 
 * Sets the favorite movies for this director
 * 
 * @param String favoriteMovies - the director's favorite movies
 */
Director.prototype.setFavoriteMovies = function(favoriteMovies) {
    this.favoriteMovies = favoriteMovies;
};

module.exports = Director;