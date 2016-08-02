(function() {
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
        this.auth = [
            {
                livestream_id: 123,
                token: '6117323d2cabbc17d44c2b44587f682c'
            },
            {
                livestream_id: 124,
                token: 'ea7cfe185d3272c677079ef590f09bb3'
            }
        ];
    };

    MockDAL.prototype.getData = function() {
        return this.data;
    };

    MockDAL.prototype.getAuth = function() {
        return this.auth;
    };

    MockDAL.prototype.getAllDirectors = function(connection, callback) {
        callback(null, this.data);
    };

    MockDAL.prototype.getDirector = function(livestreamId, connection, callback) {
        callback(null, this.data.filter(t => t.livestreamId === livestreamId));
    };

    MockDAL.prototype.createDirector = function(directorObj, connection, callback) {
        this.data.push(directorObj);
    };

    MockDAL.prototype.updateDirector = function(directorObj, connection, callback) {
        var index = this.data.map(t => t.livestream_id).indexOf(directorObj.getLivestreamId());
        if(index !== -1) {
            this.data[index].favorite_camera = directorObj.favorite_camera;
            this.data[index].favorite_movies = directorObj.favorite_movies;
        }
    };

    MockDAL.prototype.getDirectorAuthToken = function(token, connection, callback) {
        var list = this.auth.filter(t => t.token === token);
        if(list.length > 1) callback("error: more than one with same token");
        else if(list.length == 0) callback("error: no token found");
        else callback(null, { livestreamId: list[0].livestream_id });
    };

    MockDAL.prototype.createDirectorAuthToken = function(directorObj, connection, callback) {
        var hash = crypto.createHash('md5').update(directorObj.getFullName()).digest('hex');
        this.auth.push({ livestream_id: directorObj.livestreamId, token: hash });
    };

    module.exports = MockDAL;
})();