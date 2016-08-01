(function() {
    var https = require("https");

    var url = "https://api.new.livestream.com/accounts/";

    //Constructor
    function LivestreamController() {};

    LivestreamController.prototype.getAsJSON = function(id, callback){
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
})();