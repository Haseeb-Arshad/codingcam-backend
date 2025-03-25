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

This section documents the REST API endpoints provided by the CodingCam backend.  Most endpoints require authentication using a JSON Web Token (JWT) in the `Authorization` header (e.g., `Authorization: Bearer <token>`).

### Authentication

| Method | Endpoint                 | Description                                                     | Requires Auth |
| ------ | ------------------------ | --------------------------------------------------------------- | ------------- |
| POST   | `<your-backend-url>/api/auth/register` | Registers a new user.  Expects user data in the request body. | No            |
| POST   | `<your-backend-url>/api/auth/login`    | Logs in an existing user. Expects credentials in the body.    | No            |
| GET    | `<your-backend-url>/api/auth/verify` | Checks if the provided JWT is valid.                       | Yes           |

### User

| Method | Endpoint                         | Description                                                                 | Requires Auth |
| ------ | -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| GET    | `<your-backend-url>/api/users/profile` | Gets the profile of the currently authenticated user.                     | Yes           |
| PUT    | `<your-backend-url>/api/users/profile` | Updates the profile of the currently authenticated user.                   | Yes           |

### Settings

| Method | Endpoint                         | Description                                      | Requires Auth |
| ------ | -------------------------------- | ------------------------------------------------ | ------------- |
| GET    | `<your-backend-url>/api/users/settings` | Gets the settings of the authenticated user.    | Yes           |
| PUT    | `<your-backend-url>/api/users/settings` | Updates the settings of the authenticated user. | Yes           |
| POST    | `<your-backend-url>/api/users/location` | Updates the user's location.                  | Yes           |

### Analytics

| Method | Endpoint                                  | Description                                                                                                                                | Requires Auth |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| GET    | `<your-backend-url>/api/analytics/daily`     | Gets daily coding statistics for the authenticated user.                                                                                 | Yes           |
| GET    | `<your-backend-url>/api/analytics/languages` | Gets coding statistics aggregated by language for the authenticated user.                                                                   | Yes           |
| GET    | `<your-backend-url>/api/analytics/projects`  | Gets coding statistics aggregated by project for the authenticated user.                                                                  | Yes           |
| GET    | `<your-backend-url>/api/analytics/profile` | Gets a summary of the authenticated user's profile, likely related to analytics data (e.g. total coding time, most used language, etc.) | Yes          |
| GET    | `<your-backend-url>/api/analytics/report`    | Gets a comprehensive report of coding activity, likely supporting query parameters for date ranges, filtering, etc.                         | Yes           |

### Leaderboard

| Method | Endpoint                             | Description                               | Requires Auth |
| ------ | ------------------------------------ | ----------------------------------------- | ------------- |
| GET    | `<your-backend-url>/api/leaderboard` | Gets the leaderboard data (all users).    | No            |

### Extension
| Method | Endpoint                             | Description                               | Requires Auth |
| ------ | ------------------------------------ | ----------------------------------------- | ------------- |
| POST   | `<your-backend-url>/api/extension/*` | Likely handles all data from the extension   | Yes/No     |

### Other
| Method | Endpoint                             | Description                               | Requires Auth |
| ------ | ------------------------------------ | ----------------------------------------- | ------------- |
| GET   | `<your-backend-url>/health` | Checks the health of the API.    | No            |
| GET    | `<your-backend-url>/status` | Returns operational status of the backend.    | No            |

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
