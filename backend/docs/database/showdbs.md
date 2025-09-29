🎉 **You're officially connected to MongoDB!** That means:

- ✅ MongoDB is running locally as a background service
- ✅ `mongosh` is working
- ✅ You're able to run commands inside the shell

Here’s what you just saw:

```
test> show dbs
admin   40.00 KiB
config  60.00 KiB
local   40.00 KiB
```

These are the **default system databases**:

| Database | Purpose                                         |
| -------- | ----------------------------------------------- |
| `admin`  | Stores admin and authentication data            |
| `config` | Used internally for sharding/replication setup  |
| `local`  | Holds local server-specific data (e.g., oplogs) |

---

## ✅ What you can do next

### 1. **Create a test database and collection**

```js
use myAppDB
```

You'll see:

```
switched to db myAppDB
```

Then create a document:

```js
db.users.insertOne({ name: "Alice", age: 25 });
```

Check that it was inserted:

```js
db.users.find();
```

### 2. **View all databases (after inserting data)**

Run:

```js
show dbs
```

Now `myAppDB` should appear, because it contains data.

---

## 🧩 Next Step: Connect to it from your backend

Make sure your backend `.env` file contains:

```env
MONGO_URI=mongodb://localhost:27017/myAppDB
```

And that your `mongoose.connect()` uses:

```js
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

Then run:

```bash
npm run dev
```

You should see:

```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

---

Would you like to:

- Test this connection in your app?
- Create a MongoDB model and seed it?
- Add Docker next?

Let me know what you're building next!
