LivestreamAPI
===============

Quick Start
===============

Prerequisites:
- node.js / npm
- mysql

1. Clone the repo.
2. Open cmd / terminal to the root of this project
3. Run the following command to create your database

    mysql < migrations/schema.sql

4. Run the following command to install all npm dependencies

    npm install

5. You're all set up!

Running the program
===================

To run the program just run the following command from the root folder of the project.

    node app.js

To run the Jasmine unit tests, in the root folder of the project run the following command.

    npm test


About
===============

This program is a node.js API that allows directors to store their favorite
movies and camera. The API is broken up into three endpoints: GET /directors,
POST /directors, and PUT /directors.

GET /directors
---------------

Retrieves and returns all the directors found in the database in JSON.

    Example Response.
    [
        {
            "livestream_id": 1234,
            "full_name": "Jonny Boy",
            "favorite_camera": "Something",
            "favorite_movies": "Movie1, Movie2, Movie3, etc."
        }
        ...
    ]

Note that favorite_movies is just a string. If I had more time to spend on this
I would make it an array and give movies a separate table in the database so 
we could store additional information about the movie like actors, when it was released,
etc.

POST /directors
--------------
Requires 'livestream_id' in the post body. (int)

Registers a new account with this service. The API performs some type checking on the livestream_id
and then sends a GET to 'https://api.new.livestream.com/accounts/{livestream_id}' to verify it is a
registered account with livestream and get the full name of the account owner. The new account
is then saved to the database, provided another account doesn't share the same livestream_id, and
then saves the user's authorization token.

    Example request

    POST /directors
    Content-Type: application/json
    body: {
        "livestream_id": 12345
    }

    Example response

    {
        "livestream_id": 12345,
        "full_name": "Jon Snow",
        "favorite_camera": null,
        "favorite_movies": null
    }

PUT /directors/{livestream_id}
--------------
Requires header: Authorization: Bearer md5(full_name)
Requires 'favorite_camera' in the body. (String)
Requires 'favorite_movies' in the body. (String)

Updates an existing account's 'favorite_camera' 
and 'favorite_movies'. Returns the updated entry if access is granted and the change occurs.

The authorization header is used for simplified authorization. The livestream_id provided in the url
maps to a single director's account. The md5 of the full_name of that director's account must match
the provided token or else a 401 is returned.

    Example request

    PUT /directors/12345
    Content-Type: application/json
    Authorization: Bearer 0bdd627e7b8f9922caf69ee9f671982d
    body: {
        "favorite_camera": "iPhone",
        "favorite_movies": "See Spot Run, 101 Dalmations, Star Trek"
    }

    Example response

    {
        "livestream_id": 12345,
        "full_name": "Jon Snow",
        "favorite_camera": "iPhone",
        "favorite_movies": "See Spot Run, 101 Dalmations, Star Trek"
    }

Improvements
=============
If I had more time to work on this project I would clean up the app.js file, expand the database, and
add more unit tests. 

The app.js file needs a better error handling system, I would generate errors
and give them error codes. Those error codes would be specific and used for logging. The error codes would
then map to the appropriate http status code and send back a less specific error message (ie. not a stack
trace).

The database currectly treats the favorite_movies as a string. As I mentioned above, this should probably
be an array at least so we can do some type checking server side. A more complex design that I considered 
using if given more time would to make a separate table for the movies, with each row containing a foreign key
to the director's primary key. This way we're only storing each movie once, can add some meta data about the movie,
and can retrieve the movies for each account using a JOIN.

The current unit tests only cover a small amount of the API. Given more time I would add more that tested each
layer individually and then worked it's way up to create e2e tests.