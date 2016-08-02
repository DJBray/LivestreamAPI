LivestreamAPI
===============

Installation
---------------

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
-------------------
To run the program just run the following command from the root folder of the project
    node app.js
From there you can open up your favorite REST client and use the API endpoints

GET http://localhost:3000/directors

POST http://localhost:3000/directors

PUT http://localhost:3000/directors

To run the Jasmine unit tests run  
    npm test