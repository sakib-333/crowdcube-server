# Crowdcube: A Crowd Funding Application

This is a Node.js Express server that integrates several npm packages such as Express, MongoDB, CORS, dotenv. This one serves the client side of `Crowdcube`.

## Features

- **Express.js**: Web framework for building the server
- **MongoDB**: Database for storing user data and other information
- **CORS**: Enabling cross-origin requests for the server
- **dotenv**: Environment variable management

## Prerequisites

Make sure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/)
- A **MongoDB** instance (either local or cloud-based like MongoDB Atlas)

## Installation

1. Clone the repository to your local machine:

   ```bash
   git clone git@github.com:sakib-333/crowdcube-client.git

   cd crowdcube-client
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file root of the folder and all of your secret keys.

   ```bash
   DB_USERNAME=<your-db-username>

   DB_PASSWORD=<your-db-password>

   ```

4. Start server

   ```bash
   node index.js
   ```

5. Your server should now be running on `http://localhost:3000`.
