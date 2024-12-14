# Weather API

This is a NestJS application that wraps a third-party weather API and provides additional features such as caching, rate limiting, GraphQL endpoints, authentication, and background jobs.

## Features

- **Weather Endpoints**: Get current weather and 5-day forecasts from OpenWeatherMap.
- **Locations Management**: Add, list, and remove favorite locations stored in PostgreSQL.
- **GraphQL**: Provides GraphQL queries and mutations for weather and locations.
- **Caching**: Responses cached to reduce API calls.
- **Rate Limiting**: Prevents abuse of the public endpoints.
- **Error Handling**: Global exception filters and DTO validation.
- **Authentication (JWT)**: Protects favorite locations endpoints.
- **Background Jobs**: Periodic updates of cached weather for favorite locations.
- **Unit Tests**: For LocationsService, WeatherService and LocationsService.
- **Logging**: Basic logging for requests and errors.

## Setup Instructions

1. Clone the repository and install dependencies:
   ```bash
   npm install
2. Copy .env.example to .env and fill in the environment variables
    ```bash
    OPENWEATHER_API_KEY=your_openweather_api_key
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASS=postgres
    DB_NAME=weather_db
    JWT_SECRET=your_jwt_secret
3. Start a PostgreSQL instance via Docker:
    ```bash
    docker-compose up -d
4. For testing run the following command:
    ```bash
    npm run test
5. Start the application:
    ```bash
    npm run start:dev
The server runs on http://localhost:3000
## Swagger Documentation
- **URL**: http://localhost:3000/docs