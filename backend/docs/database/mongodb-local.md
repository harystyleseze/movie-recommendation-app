# 🧩 MongoDB Local Setup Guide (Linux, macOS, Windows)

---

## 🔗 Table of Contents

1. [What is MongoDB?](#what-is-mongodb)
2. [System Requirements](#system-requirements)
3. [Installation by OS](#installation-by-os)

   - [macOS](#macos-installation)
   - [Ubuntu/Linux](#linux-ubuntu-installation)
   - [Windows](#windows-installation)

4. [Starting MongoDB](#starting-mongodb)
5. [Testing MongoDB Connection](#testing-mongodb-connection)
6. [Connecting with Mongoose (Node.js)](#connecting-to-mongodb-using-mongoose)
7. [MongoDB Compass GUI (Optional)](#optional-mongodb-compass-gui)
8. [Troubleshooting](#troubleshooting)

---

## ❓ What is MongoDB?

**MongoDB** is a popular NoSQL database that stores data in JSON-like documents (`BSON` format). It's highly flexible, schema-less, and ideal for modern web applications.

---

## 💻 System Requirements

- OS: macOS, Windows 10+, or Linux (Ubuntu/Debian recommended)
- RAM: 2GB+
- Disk: 1GB+ free for database storage
- Admin/root privileges for installation

---

## 📦 Installation by OS

---

## 🍏 macOS Installation

### ✅ Using Homebrew (Recommended)

#### Step 1: Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Tap the MongoDB Formula

```bash
brew tap mongodb/brew
```

#### Step 3: Install MongoDB

```bash
brew install mongodb-community@7.0
```

#### Step 4: Start MongoDB as a Service

```bash
brew services start mongodb/brew/mongodb-community
```

#### Step 5: Verify it’s running

```bash
ps aux | grep -v grep | grep mongod
```

✅ MongoDB should be running in the background.

---

## 🐧 Linux (Ubuntu) Installation

### ✅ Step 1: Import MongoDB GPG key

```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
  sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg \
  --dearmor
```

### ✅ Step 2: Add MongoDB repository

```bash
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" \
| sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
```

> Replace `focal` with your Ubuntu version if needed (`jammy`, `bionic`, etc.)

### ✅ Step 3: Update packages and install MongoDB

```bash
sudo apt update
sudo apt install -y mongodb-org
```

### ✅ Step 4: Start MongoDB

```bash
sudo systemctl start mongod
```

To enable it on boot:

```bash
sudo systemctl enable mongod
```

### ✅ Step 5: Check Status

```bash
sudo systemctl status mongod
```

---

## 🪟 Windows Installation

### ✅ Step 1: Download MongoDB Installer

- Go to: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- Select:

  - Version: 7.0 or latest
  - OS: Windows
  - Package: **MSI**

### ✅ Step 2: Run the Installer

- Choose **Complete Setup**
- ✅ Make sure **"Install MongoDB as a Service"** is checked
- Optionally install **MongoDB Compass**

### ✅ Step 3: Verify Installation

- Open **Command Prompt** and run:

```cmd
mongod --version
```

- Start the MongoDB service:

```cmd
net start MongoDB
```

Or use **Services** GUI to start MongoDB.

### ✅ Step 4: Add MongoDB to PATH (if needed)

Ensure the path to `bin/` (e.g., `C:\Program Files\MongoDB\Server\7.0\bin`) is added to your system PATH.

---

## 🚀 Starting MongoDB

| Platform | Start Command                                        | Notes                          |
| -------- | ---------------------------------------------------- | ------------------------------ |
| macOS    | `brew services start mongodb/brew/mongodb-community` | Background service             |
| Linux    | `sudo systemctl start mongod`                        | Use `status` to check          |
| Windows  | MongoDB runs as a service                            | Use `net start MongoDB` or GUI |

---

## 🔍 Testing MongoDB Connection

### ✅ Use the MongoDB Shell

Just run:

```bash
mongosh
```

Expected output:

```bash
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
test>
```

Type:

```bash
show dbs
```

You should see built-in databases like:

```bash
admin   0.000GB
local   0.000GB
```

---

## 🧩 Connecting to MongoDB using Mongoose

If you're using Node.js, create a `.env` file:

```env
MONGO_URI=mongodb://localhost:27017/my-local-db
```

### ✅ Install Mongoose

```bash
npm install mongoose dotenv
```

### ✅ Connect using Mongoose

```js
const mongoose = require("mongoose");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
```

---

## 🖥️ Optional: MongoDB Compass GUI

MongoDB Compass is an official GUI client to visualize and manage your database.

### ✅ Install it:

- [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)

### ✅ Connect to your local DB:

Connection string:

```
mongodb://localhost:27017
```

You’ll be able to:

- Browse collections
- Insert/update documents
- View query performance

---

## 🛠️ Troubleshooting

| Problem                    | Fix                                                                 |
| -------------------------- | ------------------------------------------------------------------- |
| `ECONNREFUSED`             | MongoDB isn't running — start it using your platform's method       |
| `mongod` not found         | Not installed or not in PATH                                        |
| Port conflict on 27017     | Check if another app is using it: `lsof -i :27017`                  |
| Can't connect from app     | Ensure firewall allows 27017, and Mongo is listening on `127.0.0.1` |
| Permission errors on Linux | Try `sudo`, or check `/data/db` permissions                         |

---

## ✅ Recap

| OS      | Install Method | Start MongoDB                           | Shell     |
| ------- | -------------- | --------------------------------------- | --------- |
| macOS   | Homebrew       | `brew services start mongodb-community` | `mongosh` |
| Ubuntu  | APT repo       | `sudo systemctl start mongod`           | `mongosh` |
| Windows | MSI installer  | Auto-service / `net start MongoDB`      | `mongosh` |
