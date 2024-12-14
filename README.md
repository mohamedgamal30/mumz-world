# Weather Wrapper API

**Description:**  
The Weather Wrapper API is a production-ready NestJS application that wraps a third-party weather API (OpenWeatherMap) to provide current weather, 5-day forecasts, and user-managed favorite locations. It supports REST and GraphQL, implements caching, rate limiting, authentication, logging, and includes a background job to periodically update cached data. This repository demonstrates best practices in NestJS architecture, testing, and error handling.

## Features

- **Weather Endpoints:** Retrieve current weather and 5-day forecasts for any city.
- **Favorite Locations:** Authenticated users can add, list, and remove favorite locations stored in a PostgreSQL database.
- **GraphQL Support:** Query weather and favorite locations via GraphQL queries and mutations.
- **Caching & Rate Limiting:** Cache responses to reduce external API calls and apply rate limiting to avoid abuse.
- **Robust Error Handling:** Comprehensive try/catch, HTTP exceptions, and global exception filters ensure consistent error responses.
- **Authentication (JWT):** Secure endpoints for managing favorite locations.
- **Background Jobs:** Periodically refresh cached weather data for favorite locations.
- **Comprehensive Logging & Swagger Documentation:** Detailed request logging and professional-grade Swagger UI documentation.
- **Testing:** Thorough unit tests with Jest for core services, ensuring 100% coverage for critical components.

## Quick Start

### Prerequisites

- **Node.js 16+**
- **NPM**
- **Docker** (optional but recommended for running PostgreSQL and Redis easily)
- **OpenWeatherMap API Key** (free tier available at [https://openweathermap.org/](https://openweathermap.org/))

### Setup Instructions

1. **Clone the repository:**
    
    `git clone <REPOSITORY_URL> cd weather-wrapper`
    
2. **Install Dependencies:**
    
    `npm install`
    
3. **Environment Variables:** Create a `.env` file at the project root by copying `.env.example`:
    ```
    OPENWEATHER_API_KEY=your_api_key

    DB_HOST=localhost

    DB_PORT=5432

    DB_USER=postgres

    DB_PASS=postgres

    DB_NAME=weather_db

    JWT_SECRET=dlrowzmumtset

    REDIS_HOST=localhost

    REDIS_PORT=6379
    ```
    
4. **Database & Redis:**
    
    `docker-compose up -d`
    
    This starts a local PostgreSQL and Redis instances.
    
5. **Start the Application:**
    
    `npm run start:dev`
    
    The server will run at `http://localhost:3000`.

## Usage

### Authentication

- **Register**:

	- `POST /auth/register`
		- Request Body: 
`
- **Login:**
    
    - `POST /auth/login`
	    - Request Body: `{ "username": "test", "password": "test" }`
	    - Response: `{ "access_token": "<JWT_TOKEN>" }`
    
    Use `Authorization: Bearer <JWT_TOKEN>` for protected endpoints (e.g., favorite locations).

### REST Endpoints

- **Weather:**
    
    - `GET /weather/:city`  
        Retrieves current weather for the specified city.
        
    - `GET /forecast/:city`  
        Retrieves a 5-day forecast for the specified city.
        
- **Locations (Protected):**
    
    - `POST /locations`  
        Adds a favorite location. Body: `{ "city": "London" }`
        
    - `GET /locations`  
        Lists all favorite locations for the authenticated user.
        
    - `DELETE /locations/:id`  
        Removes the specified favorite location.
        

### GraphQL

- **Endpoint:** `POST /graphql`
    
- **Queries:**
    
    - `currentWeather(city: String!): WeatherType`
    - `forecast(city: String!): [ForecastItemType]!`
    - `favoriteLocations: [LocationType]!`
- **Mutations:**
    
    - `addFavoriteLocation(city: String!): LocationType!`
    - `removeFavoriteLocation(id: Int!): Boolean!`

Use a GraphQL client or the Playground at `http://localhost:3000/graphql` (if enabled).

## Caching & Rate Limiting

- **Caching:**  
    Responses for weather/forecast endpoints are cached to reduce external API calls. Subsequent requests for the same city return cached data immediately.
    
- **Rate Limiting:**  
    For Rest endpoints and Graphql,  by default endpoints have a global rate limit configured (e.g., 10 requests per 60 seconds). Exceeding the limit returns `429 Too Many Requests`.
    

## Background Jobs

- A scheduled job runs periodically (e.g., 1 hr) to refresh cached weather data for all locations. This keeps frequently requested data warm and up-to-date.
- It updates the DB and Redis.

### Swagger Documentation

- **URL:** `http://localhost:3000/docs`