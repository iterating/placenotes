https://github.com/iterating/placenotes

A loved one arrives at the imposing corporate tower where they are having thier interview, and gets a message:
"You've got this! You're not just qualified for this role; you're the perfect fit. Go in there and show them the incredible person I see every day. I'm so proud of you and I'm cheering you on all the way. 💖"

You arrive at Costco, and get a message:
" 2024.10.25 out of paper towel rolls
- [ ] eggs
- [ ] milk
- [ ] oatmeal
- [x] cheese got xl pack 10-15 
- [ ] malbec wine "
It's your Costco shopping list, and it pops up when you arrive at Costco. 

**Placenotes** is a powerful messaging and notetaking app that adds the element of location to your messages.

Built with Express and Mongodb
This is a work in progress.

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
- EJS renders UI components. It modularizes components such as the drawer UI, to keep DRY

- The application runs the following **middleware**:
  - `autoLogin`: checks if a user is logged in and if not attempts to log them in using a cookie if present
  - `setUser`: sets the user on the request object if the user is logged in.
  - `passport.js`: Provides authentication services. Future development will include Google OAuth. 
## MongoDB Database
- The API and MongoDB database supports full CRUD Operations
## MVC Architecture
- The app uses the Model View Controller (MVC) architecture to separate concerns between the database, user interface, and application logic. This allows for easier maintenance and scalability of the application.

  - **Model**: defines the data layer of the application, which includes the database schema and any operations that interact with the database. This layer is responsible for retrieving and storing data in the database.

  - **View**: defines the user interface layer of the application, which includes the templates and static assets. This layer is responsible for rendering the user interface and any static assets.

  - **Controller**: defines the application logic layer of the application, which includes the API endpoints and any operations that interact with the Model and View. This layer is responsible for receiving requests, interacting with the Model and View, and sending responses back to the user.
- This organization practices **clean coding** and supports development of my application
  
## How To Run

1. `npm install` to install all dependencies
2. `npm run seed` to seed the database with sample data
3. `npm run dev` to start the server in development mode
4. Open a web browser and navigate to `localhost:3000` to access the app



