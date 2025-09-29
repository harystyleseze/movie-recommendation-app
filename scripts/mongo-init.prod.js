// MongoDB initialization script for production
db = db.getSiblingDB('moveere_prod');

// Create application user for production with strong password
db.createUser({
  user: process.env.MONGO_APP_USER || 'moveere_user',
  pwd: process.env.MONGO_APP_PASSWORD || 'change_this_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'moveere_prod'
    }
  ]
});

// Create collections with proper configuration
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password"],
      properties: {
        name: { bsonType: "string", minLength: 2, maxLength: 50 },
        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
        password: { bsonType: "string", minLength: 60, maxLength: 60 },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
});

db.createCollection('movies');
db.createCollection('recommendations');

// Create optimized indexes for production
db.users.createIndex({ "email": 1 }, { unique: true, background: true });
db.users.createIndex({ "createdAt": 1 }, { background: true });
db.users.createIndex({ "updatedAt": 1 }, { background: true });

db.movies.createIndex({ "title": 1 }, { background: true });
db.movies.createIndex({ "genre": 1 }, { background: true });
db.movies.createIndex({ "releaseYear": 1 }, { background: true });
db.movies.createIndex({ "imdbId": 1 }, { unique: true, sparse: true, background: true });
db.movies.createIndex({ "createdAt": 1 }, { background: true });

db.recommendations.createIndex({ "userId": 1 }, { background: true });
db.recommendations.createIndex({ "movieId": 1 }, { background: true });
db.recommendations.createIndex({ "createdAt": 1 }, { background: true });
db.recommendations.createIndex({ "userId": 1, "movieId": 1 }, { unique: true, background: true });

print('Production database initialized successfully with proper indexes and validation');