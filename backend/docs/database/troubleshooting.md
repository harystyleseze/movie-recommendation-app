The error you're seeing:

```
❌ MongoDB connection failed: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

means your backend server **could not connect to MongoDB running on `localhost:27017`**, because:

> ✅ MongoDB is **not running**, or
> ❌ it's **not accepting connections** on the default port (27017).

---

## 🔍 What this error means (in plain terms):

- Your `.env` file likely contains:

```env
MONGO_URI=mongodb://localhost:27017/your-db-name
```

- Your backend tried to connect to MongoDB on `localhost (127.0.0.1)` or `::1` (IPv6 localhost)
- That connection was **refused**, meaning nothing is listening on port `27017`.

---

## ✅ How to fix it

### ✅ Step 1: Make sure MongoDB is installed

Run:

```bash
mongod --version
```

If it says "command not found", install MongoDB:

- On macOS (Homebrew):

```bash
brew tap mongodb/brew
brew install mongodb-community
```

---

### ✅ Step 2: Start MongoDB locally

If MongoDB is installed via Homebrew:

```bash
brew services start mongodb-community
```

You can also run it manually:

```bash
mongod --dbpath /usr/local/var/mongodb
```

> If you get permission errors, run with `sudo` or check file permissions.

---

### ✅ Step 3: Verify MongoDB is running

Run this:

```bash
mongo
```

If successful, you’ll see:

```
MongoDB shell version ...
connecting to: mongodb://127.0.0.1:27017
```

Or test with a client like **MongoDB Compass**.

---

### ✅ Step 4: Restart your backend

Once MongoDB is running:

```bash
npm run dev
```

You should now see:

```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

---

## 🧠 Pro Tip: Use Docker for MongoDB (optional)

If you don't want to install MongoDB locally, run it in Docker:

```bash
docker run -d -p 27017:27017 --name mongo mongo
```

This starts a MongoDB container accessible at `localhost:27017`.

---

## Recap

| Step | What to do                                              |
| ---- | ------------------------------------------------------- |
| ✅ 1 | Make sure MongoDB is installed                          |
| ✅ 2 | Start MongoDB (`brew services start mongodb-community`) |
| ✅ 3 | Confirm it's running (`mongo`)                          |
| ✅ 4 | Restart your server (`npm run dev`)                     |

---

---

You're almost there — MongoDB is **installed**, the **service is running**, and `mongod` is working. But you're getting this:

```bash
zsh: command not found: mongo
```

This happens because as of **MongoDB 6.0+**, the legacy `mongo` shell is **deprecated** and replaced by the **new shell**: `mongosh`.

---

## ✅ Fix: Use `mongosh` instead of `mongo`

Run:

```bash
mongosh
```

If that works, you’ll see:

```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
test>
```

From here, you can run commands like:

```js
show dbs
use myDatabase
db.test.insertOne({ hello: "world" })
```

---

## ❓ What if `mongosh` is also not found?

Then you may need to install it separately.

### ✅ Step 1: Install `mongosh` via Homebrew

```bash
brew install mongosh
```

### ✅ Step 2: Try again

```bash
mongosh
```

---

## 💡 Quick Test

Once you're in `mongosh`, test inserting data:

```js
use myTestDB
db.users.insertOne({ name: "John Doe", email: "john@example.com" })
db.users.find()
```

---

## ✅ Recap

| Command   | Purpose                                    |
| --------- | ------------------------------------------ |
| `mongod`  | MongoDB server daemon (already running)    |
| `mongosh` | New interactive shell to connect and query |
| `mongo`   | ❌ Deprecated since MongoDB 6.0            |

---
