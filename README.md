# CodingCam - Backend

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This repository contains the backend code for CodingCam, a system for tracking and visualizing developer coding activity.  The backend provides a REST API that serves data to the [CodingCam Frontend](<your-frontend-repo-url>) and receives data from the [CodingCam Extension](https://github.com/Haseeb-Arshad/codingcam-extension).  It handles user authentication, data storage, and processing.

## Technologies Used

*   **Node.js:** A JavaScript runtime environment.
*   **Express.js:** A web application framework for Node.js.
*   **MongoDB:** A NoSQL database used for storing user data, coding activity, and project information.
*   **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js, providing a schema-based solution to model application data.
*   **JSON Web Tokens (JWT):** Used for secure user authentication.
*   **Pinata Cloud:** Used as an intermediary for storing user avatar images on IPFS (InterPlanetary File System).
* **Typescript**:  A superset of JavaScript that adds static typing.

## API Endpoints

The backend exposes several REST API endpoints for managing users, projects, coding activity, and other data.  (A more detailed API documentation would typically be provided here, perhaps using a tool like Swagger/OpenAPI.  For this example, I'll list a few key endpoints.)

*   `/api/users/register`:  Registers a new user.
*   `/api/users/login`:  Logs in an existing user and returns a JWT.
*   `/api/users/me`:  Gets the currently logged-in user's profile.
*   `/api/projects`:  Manages user projects (create, read, update, delete).
*   `/api/activity`:  Receives and stores coding activity data from the extension.
*   `/api/reports`:  Provides aggregated coding activity data for reports.
*   `/api/leaderboard`:  Provides data for the leaderboard.
* `/api/upload-avatar`: Handles the avatar images.

## Getting Started

### Prerequisites

*   **Node.js:** (v16 or higher recommended)
*   **npm:** (or yarn)
*   **MongoDB:**  You'll need a running MongoDB instance. You can run it locally or use a cloud service like MongoDB Atlas.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Haseeb-Arshad/codingcam-backend.git
    cd codingcam-backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Create a `.env` file:**

    Create a `.env` file in the root directory and add the following environment variables (replace with your actual values):

    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    PINATA_API_KEY=<your_pinata_api_key>
    PINATA_SECRET_KEY=<your_pinata_secret_key>
    PORT=5000
    ```

    *   **`MONGO_URI`:** Your MongoDB connection string.
    *   **`JWT_SECRET`:** A strong, secret key for signing JWTs.  Generate a secure random string.
    *   **`PINATA_API_KEY` and `PINATA_SECRET_KEY`:** Your API keys for Pinata Cloud (if you're using it for avatar storage).
    * **`PORT`:** define the port number.

4.  **Run the server:**

    ```bash
     npm run dev
    # or
    yarn dev
    ```

    This will start the backend server, typically on port 5000 (or the port you specified in your `.env` file).

## Contributing

(Same contribution guidelines as the frontend - fork, branch, make changes, commit, push, pull request)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

*   Provides data to the [CodingCam Frontend]([<your-frontend-repo-url>](https://github.com/Haseeb-Arshad/CodingCam).
*   Receives data from the [CodingCam Extension](https://github.com/Haseeb-Arshad/codingcam-extension).
