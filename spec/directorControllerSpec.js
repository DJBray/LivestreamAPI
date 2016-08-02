var crypto = require('crypto');
var Director = require('../models/director.js');
var DirectorController = require('../controllers/directorController.js');

var url = 'http://localhost:3000/directors';

//Begin mocks
var MockDAL = require('./mockDAL.js');

var mockConnection = {
    query: function(query, callback) {
        callback([]);
    }
};
//End mocks

//Begin tests
describe("Director Controller", function() {
    describe("getDirectors", function() {
        it("makes a query to the db", function(done) {
            var mockDAL = new MockDAL();
            var directorController = new DirectorController(mockDAL);
            directorController.getDirectors(mockConnection, function(err, result) {
                expect(err).toBeNull();
                expect(result).toEqual(mockDAL.getData());
                done();
            });
        });
    });

    describe("createDirector", function() {
        it("creates a director when none exist with that id", function(done) {
            var mockDAL = new MockDAL();
            var director = new Director(12, "Adam", null, null);
            var directorController = new DirectorController(mockDAL);
            directorController.createDirector(director, mockConnection, function(err, result) {
                expect(err).toBeNull();
                expect(result).toEqual(director);

                var data = mockDAL.getData();
                var val = data.filter(t => t.livestream_id === director.getLivestreamId());

                expect(val.length).toEqual(1);
                expect(val[0].livestream_id).toEqual(director.getLivestreamId());
                expect(val[0].full_name).toEqual(director.getFullName());
                expect(val[0].favorite_camera).toEqual(director.getFavoriteCamera());
                expect(val[0].favorite_movies).toEqual(director.getFavoriteMovies());
                done();
            });
        });

        it("doesn't allow a new account to have the same livestreamId as another", function(done) {
            var mockDAL = new MockDAL();
            var director = new Director(123, "Johnny Boy", null, null);
            var directorController = new DirectorController(mockDAL);
            directorController.createDirector(director, mockConnection, function(err, result) {
                expect(err).not.toBeNull();
                expect(result).toBeUndefined();

                var data = mockDAL.getData();
                var val = data.filter(t => t.livestream_id === director.getLivestreamId()
                    && t.full_name === director.getFullName());
                expect(val.length).toBe(0);
                done();
            });
        });

        it("adds an auth token when a new director is created", function(done) {
            var mockDAL = new MockDAL();
            var director = new Director(12, "Adam", null, null);
            var directorController = new DirectorController(mockDAL);
            directorController.createDirector(director, mockConnection, function(err, result) {
                expect(err).toBeNull();
                expect(result).toEqual(director);

                var auth = mockDAL.getAuth();
                var val = auth.filter(t => t.livestream_id === director.getLivestreamId());

                expect(val.length).toEqual(1);
                expect(val[0].livestream_id).toEqual(director.getLivestreamId());

                var hash = crypto.createHash('md5').update(director.getFullName()).digest('hex');
                expect(val[0].token).toEqual(hash);
                done();
            });
        });
    });

    describe('updateDirector', function() {
        it('requires the token to match an entry in the auth table', function(done) {
            var mockDAL = new MockDAL();
            var token = 'asdf';
            var favoriteCamera = 'Meh';
            var favoriteMovies = 'bleh';
            var directorController = new DirectorController(mockDAL);
            directorController.updateDirector(token, favoriteCamera, favoriteMovies, mockConnection, function(err, result) {
                expect(err).not.toBeNull();
                expect(result).toBeUndefined();
                //TODO check the md5 and fix the auth filter below
                
                var auth = mockDAL.getAuth();
                var val = auth.filter(t => t.favorite_camera === favoriteCamera || t. favorite_movies === favoriteMovies);

                expect(val.length).toEqual(0);
                done();
            });
        });

        it('updates favorite camera and favorite movies', function(done) {
            var mockDAL = new MockDAL();
            var token = '6117323d2cabbc17d44c2b44587f682c';
            var favoriteCamera = 'meh';
            var favoriteMovies = 'bleh';
            var directorController = new DirectorController(mockDAL);
            directorController.updateDirector(token, favoriteCamera, favoriteMovies, mockConnection, function(err, result) {
                expect(err).toBeNull();

                var auth = mockDAL.getAuth();
                var val = auth.filter(t => t.token === token);
                var id = val[0].livestream_id;

                var data = mockDAL.getData();
                val = data.filter(t => t.livestream_id === id);

                expect(result).toEqual(val);
                done();
            });
        });
    });
});
//End tests