// MongoDB initialization script for development
db = db.getSiblingDB('moveere_dev');

// Create application user for development
db.createUser({
  user: 'moveere_dev_user',
  pwd: 'dev_password123',
  roles: [
    {
      role: 'readWrite',
      db: 'moveere_dev'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.createCollection('movies');
db.createCollection('recommendations');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.movies.createIndex({ "title": 1 });
db.movies.createIndex({ "genre": 1 });
db.movies.createIndex({ "releaseYear": 1 });
db.movies.createIndex({ "imdbId": 1 }, { unique: true, sparse: true });

db.recommendations.createIndex({ "userId": 1 });
db.recommendations.createIndex({ "movieId": 1 });
db.recommendations.createIndex({ "createdAt": 1 });

print('Development database initialized successfully');