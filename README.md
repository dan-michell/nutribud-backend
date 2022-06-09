# Nutribud Backend Documentation

## Contents

## Introduction

This is the backend server of the Nutribud desktop app that handles http requests from the client to retrieve nutrition information and user performance, as well as post user goals and information.

## Technologies

This repository uses [node](https://nodejs.org/api/) to run its files. The Node web framework [Express](https://expressjs.com/) was used to write the endpoint paths and handlers. For our database we use [PostgreSQL](https://www.postgresql.org/) to store user data online using [ElephantSQL](https://www.elephantsql.com/). For voice and text searches we use Edamam's [Food and Grocery Database API](https://developer.edamam.com/food-database-api). For barcode searches we use [Open Food Facts API](https://openfoodfacts.github.io/api-documentation/)

## Launch

There is another repository which is closely related and can be found [here](https://github.com/Sigma-Labs-XYZ/nutribud-frontend). It is recommended that you create a folder and clone both the frontend and backend repos into the same folder.

Start by forking this backend repository, and then cloning the repository into your local drive. Toggle into the directory, /nutribud-backend, and run the following command into your terminal to initiate the backend server:

`node server.js`

The frontend React application requires this backend server to be running to work correctly as it uses http://localhost:8080 as the API link in the development environment variables.

## Database Schema

## Server Endpoints

### /login

The `/login` endpoint handles adding an existing user's id to the sessions table along with the cookie session id, deleting a user from the sessions table as well as verifying a user is logged in.

#### Logging In

Logging in is done with the POST HTTP Method to the `/login` endpoint.

The body of the POST request **_must_** contain:

- username
- password

Example of a fetch request:

```
 await fetch(`http://localhost:8080/login`, {
    method: "POST", credentials: "include",
    headers: { "Content-Type": "application/json", },
    body: JSON.stringify({
      username:'admin',
      password:'somePassword',
    }),
    });
```

If the username is not registered or the password is wrong the server will respond with a 400 status code (bad request).

#### Logging Out

Logging out is done with a DELETE HTTP Method to the `/login` endpoint.

Example of a fetch request:

```
await fetch(`http://localhost:8080/login`, {
    method: "DELETE", credentials: "include",
    headers: { "Content-Type": "application/json", },
    });
```

If the user is not logged in the server will respond with a 400 status code (bad request).

#### Verifying a User is Logged In

Verifying a user is logged in is done with a GET HTTP Method to the `/login` endpoint.

Example of a fetch request:

```
 await fetch(`http://localhost:8080/login`, {
    method: "GET", credentials: "include",
    headers: { "Content-Type": "application/json", },
    });
```

### /register

The `/register` endpoint handles adding a new user to the users table.

This is done with a POST HTTP Method to the `/register` endpoint.

The body of the POST request **_must_** contain:

- username
- password
- passwordConfirmation

Example of a fetch request:

```
await fetch(`http://localhost:8080/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      username:'admin',
      password:'somePassword',
      passwordConfirmation:'somePassword',
    }),
    });
```

If the username is already registered or the passwords do not match the server will respond with a 400 status code (bad request).

### /search-text

The `/search-text` endpoint handles requests to Edamam's [Food and Grocery Database API](https://developer.edamam.com/food-database-api) and returns nutritional information for a given item.

This is done with a GET HTTP Method and the following query parameter:

- item

Example of a fetch request:

```
await fetch(`http://localhost:8080/search-text?item=${encodeURIComponent('bread')}`);
```

If the fetch request does no have an item query parameter the server will respond with a 400 status code (bad request).

### /search-barcode

The `search-barcode` endpoint handles requests to [Open Food Facts API](https://openfoodfacts.github.io/api-documentation/) and returns nutritional information for a given item.

This is done with a GET HTTP Method and the following query parameter:

- barcode

Example of a fetch request:

```
await fetch(`http://localhost:8080/search-text?barcode=${5449000000996}`);
```

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
