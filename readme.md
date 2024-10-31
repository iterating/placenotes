https://github.com/iterating/placenotes

This is a work in progress of a webapp that allows taking

## Express server application
### RESTful API
The Placenotes server is a RESTful API build on Express that supports the following actions:
- POST /login
	- Directs user to login form
- POST /login
	+ Creates a new user

- GET /users pr /users/all
	+ Retrieves all users
- GET /users/:id
	+ Retrieves the user with the specified id
	- alternate: GET  /users?id=:id
- GET /users/:name
	+ Retrieves the user with the specified name
	- alternate: GET  /users?name=:name
- GET /users/email/:email
	- retrieves user with the specified email
	- alternate /users?email=:email
- GET /users/group/:group
	- retrieves user by the specified group
	- alternate /users?email=:email
- GET /users/:id/notes
	+ Retrieves all notes for the user with the specified id

- GET /users/:id/time/:time
	+ Retrieves all notes for the user at the specified time
	- alternate /users/:id/?time=:time

- GET /users/:id/notes/:id
	+ Retrieved a single note wiht _id ot noteId for the user with the specified _id of userId
- PUT /users/:id/notes/:id 
	+ Updates a single note wiht _id ot noteId for the user with the specified _id of userId
- DELETE /users/:id/notes/:id 
	+ Deletes a single note for the user with the specified id

- GET /notes
	+ Retrieves all notes for the logged in user
- GET /notes/:id
	+ Retrieves the note with the specified id

- GET /notes/:time
	- Retrieces note created by the logged in user and the specified time
- PUT /notes/:time
	- Updates note created by the logged in user and the specified time
- DELETE /notes/:time
	- Deletes note created by the logged in user and the specified time

- GET /notes/:location
	+ Retrieves notes created at the specified location

### Template Engine and Middleware
- A *template engine* renders views with Express

- The application runs the following **middleware**:
  - `autoLogin`: checks if a user is logged in and if not attempts to log them in using a cookie if present
  - `setUser`: sets the user on the request object if the user is logged in
  - `passport.js`: Provides authentication services. Future development will include Google OAuth. 
### MongoDB Database
- The API and MongoDB database supports full CRUD Operations

## How To Run

1. `npm install` to install all dependencies
2. `npm run seed` to seed the database with sample data
3. `npm run dev` to start the server in development mode
4. Open a web browser and navigate to `localhost:3000` to access the app

