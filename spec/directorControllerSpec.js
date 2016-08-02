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
    });

    describe('updateDirector', function() {
        it('requires the token to match before changing anything', function(done) {
            var livestreamId = 123;
            var mockDAL = new MockDAL();
            var token = 'asdf';
            var favoriteCamera = 'Meh';
            var favoriteMovies = 'bleh';
            var origRow = mockDAL.getData().filter(t => t.livestream_id === livestreamId)[0];
            var directorController = new DirectorController(mockDAL);
            directorController.updateDirector(livestreamId, token, favoriteCamera, favoriteMovies, mockConnection, function(err, result) {
                expect(err).not.toBeNull();
                expect(result).toBeUndefined();
                
                var data = mockDAL.getData();
                var val = data.filter(t => t.livestream_id === livestreamId);
                expect(val.length).toBe(1);
                val = val[0];

                var hash = crypto.createHash('md5').update(val.full_name).digest('hex');
                expect(hash).not.toEqual(token);

                expect(val.favorite_camera).not.toEqual(favoriteCamera);
                expect(val.favorite_movies).not.toEqual(favoriteMovies);
                expect(val.favorite_camera).toEqual(origRow.favorite_camera);
                expect(val.favorite_movies).toEqual(origRow.favorite_movies);
                done();
            });
        });

        it('updates favorite camera and favorite movies when tokens match', function(done) {
            var livestreamId = 123;
            var mockDAL = new MockDAL();
            var token = '6117323d2cabbc17d44c2b44587f682c';
            var favoriteCamera = 'meh';
            var favoriteMovies = 'bleh';
            var directorController = new DirectorController(mockDAL);
            directorController.updateDirector(livestreamId, token, favoriteCamera, favoriteMovies, mockConnection, function(err, result) {
                expect(err).toBeNull();
                
                var data = mockDAL.getData();
                var val = data.filter(t => t.livestream_id === livestreamId);
                expect(val.length).toBe(1);
                val = val[0];

                var hash = crypto.createHash('md5').update(val.full_name).digest('hex');
                expect(hash).toEqual(token);

                expect(val.favorite_camera).toEqual(favoriteCamera);
                expect(val.favorite_movies).toEqual(favoriteMovies);
                done();
            });
        });
    });
});
//End tests