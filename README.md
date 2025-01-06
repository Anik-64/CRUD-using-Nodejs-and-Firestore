# CRUD using Node.js and Firestore

This project demonstrates a basic CRUD (Create, Read, Update, Delete) application using Node.js and Firestore as the database. It implements various security measures and follows best practices for building secure and efficient APIs.

## Features
- Create, Read, Update, and Delete operations for `users`.
- Data is stored in a Firestore database.
- Secure APIs using modern security packages.
- Access logging using `morgan`.

## Technologies Used
- **Node.js**: Backend framework.
- **Firestore**: NoSQL database for storing user data.

## Packages Used

### Security Packages
- **`cors`**: Enables Cross-Origin Resource Sharing.
- **`body-parser`**: Parses incoming request bodies.
- **`helmet`**: Secures HTTP headers.
- **`express-rate-limit`**: Rate limits API requests to prevent abuse.
- **`xss`**: Protects against Cross-Site Scripting attacks by sanitizing user input.
- **`express-validator`**: Validates and sanitizes incoming data.
- **`cookie-parser`**: Parses cookies for secure and flexible cookie management.
- **`bcrypt`**: Hashed password.
- **`dotenv`**: Loads environment variables from a `.env` file.

### Logging
- **`morgan`**: Logs HTTP requests and responses.

### Firebase
- **`firebase-admin`**: Provides access to Firebase functionalities, including Firestore.

## API Endpoints

### 1. Create User
**POST** `/api/users`
- **Body**:
  ```json
  {
    "email": "string",
    "firstname": "string",
    "lastname": "string (optional)",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "error": false,
    "message": "Successfully created user",
    "data": {
      "id": "Firestore-generated-ID",
      "email": "string",
      "firstname": "string",
      "lastname": "string",
      "createdAt": "timestamp"
    }
  }
  ```

### 2. Get All Users
**GET** `/api/users`
- **Response**:
  ```json
  {
    "error": false,
    "data": [
      {
        "id": "Firestore-generated-ID",
        "email": "string",
        "firstname": "string",
        "lastname": "string",
        "createdAt": "timestamp"
      }
    ]
  }
  ```

### 3. Get User by ID
**GET** `/api/users/:id`
- **Response**:
  ```json
  {
    "error": false,
    "data": {
      "id": "Firestore-generated-ID",
      "email": "string",
      "firstname": "string",
      "lastname": "string",
      "createdAt": "timestamp"
    }
  }
  ```

### 4. Update User
**PUT** `/api/users/:id`
- **Body** (optional fields):
  ```json
  {
    "email": "string",
    "firstname": "string",
    "lastname": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "error": false,
    "message": "User updated successfully",
    "data": {
      "id": "Firestore-generated-ID",
      "email": "string",
      "firstname": "string",
      "lastname": "string",
      "updatedAt": "timestamp"
    }
  }
  ```

### 5. Delete User
**DELETE** `/api/users/:id`
- **Response**:
  ```json
  {
    "error": false,
    "message": "User deleted successfully"
  }
  ```
