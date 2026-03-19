// Perform initialization for the main database
const appDbName = process.env.MONGO_APP_DB;
const dbUser = process.env.MONGO_APP_USER;
const dbPassword = process.env.MONGO_APP_PASSWORD;

// Switch to the application database
db = db.getSiblingDB(appDbName);

db.createUser({
  user: dbUser,
  pwd: dbPassword,
  roles: [
    {
      role: "readWrite",
      db: appDbName
    }
  ]
});

db.createCollection("recipes");
db.createCollection("refresh_tokens");
db.createCollection("users");

print(
  `Initialized database "${appDbName}" and user "${dbUser}" with readWrite role.`
);
