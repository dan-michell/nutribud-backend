# Nutribud Backend Documentation

## Contents

## Introduction

This is the backend server of the Nutribud desktop app that handles http requests from the client to retrieve nutrition information and user performance, as well as post user goals and information.

## Technologies

This repository uses [node] (https://nodejs.org/api/) to run its files. The Node web framework [Express] (https://expressjs.com/) was used to write the endpoint paths and handlers. For our database we use [PostgreSQL] (https://www.postgresql.org/) to store user data online using [ElephantSQL] (https://www.elephantsql.com/).

## Launch

There is another repository which is closely related and can be found [here](https://github.com/Sigma-Labs-XYZ/nutribud-frontend). It is recommended that you create a folder and clone both the frontend and backend repos into the same folder.

Start by forking this backend repository, and then cloning the repository into your local drive. Toggle into the directory, /nutribud-backend, and run the following command into your terminal to initiate the backend server:

`node server.js`

The frontend React application requires this backend server to be running to work correctly as it uses http://localhost:8080 as the API link in the development environment variables.

## Server Endpoints

## Database Schema

### Logging In

The `/login` endpoint handles adding an existing user's id to the sessions table along with the cookie session id.

This is done with the POST HTTP Method to the /scores endpoint.

The body of the POST request must contain:

- The username
- The password

Example of a fetch request:

`` await fetch(`http://localhost:8080/login`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json", }, body: JSON.stringify(userLoginDetails), }); ``

If the username is not registered or the password is wrong the server will respond with a 400 status code (bad request).

### Logging Out

### Registering

###

## Packages installed:

- npm install express
- npm install cookie-parser
- npm install cors
- npm i pbkdf2-password-hash
- npm install pg
- npm install bcrypt
- npm install crypto
- npm install jest --save-dev
- npm install supertest --save-dev

```

```
