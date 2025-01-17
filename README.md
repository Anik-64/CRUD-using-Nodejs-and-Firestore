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

Here, you can find all service API [Postman](https://documenter.getpostman.com/view/33257219/2sAYQakr9R) 
<img align="right" src="https://wso2.cachefly.net/wso2/sites/all/2021-theme/apim-2021/apim4-animations/apim-page-animation-get-business-insights-and-intelligence-through-APIs.gif">
