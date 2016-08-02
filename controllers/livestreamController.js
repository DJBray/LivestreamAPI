/**
 * livestreamController.js
 * 
 * Provides methods to interact with the livestream API
 */

var https = require("https");

var url = "https://api.new.livestream.com/accounts/";

//Constructor
function LivestreamController() {};

/**
 * getLivestreamAccount
 * 
 * Performs a GET to the livestream accounts API to find the account 
 * with a matching livestream_id.
 * 
 * @param int id - The livestream_id to match against
 * @param function(error, statusCode, response) callback - the callback function to call on error or completion.
 */
LivestreamController.prototype.getLivestreamAccount = function(id, callback){
    var request = https.get(url+id, function(res) {
        var responseData = '';

        res.on('data', function(chunk) {
            responseData += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(responseData);
            callback(null, res.statusCode, obj);
        });
    });

    request.on('error', function(error) {
        callback(error);
    });

    request.end();
};

module.exports = LivestreamController;