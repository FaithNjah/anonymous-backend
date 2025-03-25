Sure! Below is the tutorial formatted as a **Markdown (`.md`) file**. You can copy and paste this into a file named `unit-testing-tutorial.md` and save it in your codebase.

---

# Unit Testing Tutorial for Express API

This tutorial explains how to write unit tests for an Express API using **Jest** and **Supertest**. We’ll test the endpoints in your `routes/index.js` file.

---

## Table of Contents

1. [Set Up Testing Environment](#set-up-testing-environment)
2. [Mock the Database](#mock-the-database)
3. [Write Unit Tests](#write-unit-tests)
    - [Test the Root Endpoint (`/`)](#1-test-the-root-endpoint-)
    - [Test the `/messages/:username` Endpoint](#2-test-the-messagesusername-endpoint)
    - [Test the `/message/:username` Endpoint](#3-test-the-messageusername-endpoint)
    - [Test the `/sign-up` Endpoint](#4-test-the-sign-up-endpoint)
    - [Test the `/sign-in` Endpoint](#5-test-the-sign-in-endpoint)
    - [Test the `/resetpasscode/:id` Endpoint](#6-test-the-resetpasscodeid-endpoint)
4. [Run the Tests](#run-the-tests)
5. [Folder Structure](#folder-structure)

---

## Set Up Testing Environment

1. **Install Dependencies**:
   Install Jest and Supertest:

    ```bash
    npm install --save-dev jest supertest
    ```

2. **Configure Jest**:
   Add a `jest.config.js` file to configure Jest:

    ```javascript
    module.exports = {
        testEnvironment: "node", // Use Node.js environment
        coveragePathIgnorePatterns: ["/node_modules/"], // Ignore node_modules
    };
    ```

3. **Add a Test Script**:
   Update `package.json` to include a test script:
    ```json
    "scripts": {
        "test": "jest"
    }
    ```

---

## Mock the Database

Since unit tests should not depend on a real database, we’ll mock the database calls using **Jest mocking**.

1. **Mock the Models**:
   Create a `__mocks__` directory in the root of your project and add mock implementations for `User` and `Message` models.

    ```javascript
    // __mocks__/user.model.js
    module.exports = {
        findOne: jest.fn(),
        save: jest.fn(),
        findByIdAndUpdate: jest.fn(),
    };
    ```

    ```javascript
    // __mocks__/message.model.js
    module.exports = {
        find: jest.fn(),
        save: jest.fn(),
    };
    ```

2. **Mock the Token Generation**:
   If `generateAuthToken` is a method on the `User` model, mock it as well:
    ```javascript
    // __mocks__/user.model.js
    module.exports = {
        findOne: jest.fn(),
        save: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        generateAuthToken: jest.fn().mockReturnValue("mock-token"),
    };
    ```

---

## Write Unit Tests

### 1. Test the Root Endpoint (`/`)

This is a simple endpoint that returns a "working fine" message.

```javascript
const request = require("supertest");
const app = require("express")();
const router = require("../routes/index");

app.use(router);

describe("GET /", () => {
    it("should return 'working fine'", async () => {
        const res = await request(app).get("/");
        expect(res.status).toBe(200);
        expect(res.text).toBe("working fine");
    });
});
```

---

### 2. Test the `/messages/:username` Endpoint

This endpoint fetches messages for a user.

```javascript
const User = require("../models/user.model");
const Message = require("../models/message.model");

describe("GET /messages/:username", () => {
    it("should return 400 if user does not exist", async () => {
        User.findOne.mockResolvedValue(null); // Mock user not found

        const res = await request(app).get("/messages/nonexistentuser");
        expect(res.status).toBe(400);
        expect(res.body.message).toBe("User does not exist");
    });

    it("should return messages for a valid user", async () => {
        const mockUser = { _id: "123", username: "testuser" };
        const mockMessages = [{ message: "Hello", ipAddress: "127.0.0.1" }];

        User.findOne.mockResolvedValue(mockUser); // Mock user found
        Message.find.mockResolvedValue(mockMessages); // Mock messages found

        const res = await request(app).get("/messages/testuser");
        expect(res.status).toBe(200);
        expect(res.body.messages).toEqual(mockMessages);
    });
});
```

---

### 3. Test the `/message/:username` Endpoint

This endpoint sends a message to a user.

```javascript
describe("POST /message/:username", () => {
    it("should return 400 if user does not exist", async () => {
        User.findOne.mockResolvedValue(null); // Mock user not found

        const res = await request(app)
            .post("/message/nonexistentuser")
            .send({ message: "Hello", ipAddress: "127.0.0.1" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("User does not exist");
    });

    it("should send a message to a valid user", async () => {
        const mockUser = { _id: "123", username: "testuser" };
        User.findOne.mockResolvedValue(mockUser); // Mock user found
        Message.prototype.save.mockResolvedValue(true); // Mock message saved

        const res = await request(app)
            .post("/message/testuser")
            .send({ message: "Hello", ipAddress: "127.0.0.1" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Message successfully sent!");
    });
});
```

---

### 4. Test the `/sign-up` Endpoint

This endpoint creates a new user.

```javascript
describe("POST /sign-up", () => {
    it("should return 400 if user already exists", async () => {
        User.findOne.mockResolvedValue({ username: "existinguser" }); // Mock user found

        const res = await request(app)
            .post("/sign-up")
            .send({ username: "existinguser", password: "password" });

        expect(res.status).toBe(400);
        expect(res.text).toBe("User already exists");
    });

    it("should create a new user", async () => {
        User.findOne.mockResolvedValue(null); // Mock user not found
        User.prototype.save.mockResolvedValue(true); // Mock user saved

        const res = await request(app)
            .post("/sign-up")
            .send({ username: "newuser", password: "password" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Account successfully created!");
    });
});
```

---

### 5. Test the `/sign-in` Endpoint

This endpoint authenticates a user.

```javascript
describe("POST /sign-in", () => {
    it("should return 400 if username or password is missing", async () => {
        const res = await request(app)
            .post("/sign-in")
            .send({ username: "", password: "" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("username and password not found");
    });

    it("should return 400 if user does not exist", async () => {
        User.findOne.mockResolvedValue(null); // Mock user not found

        const res = await request(app)
            .post("/sign-in")
            .send({ username: "nonexistentuser", password: "password" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("User not found");
    });

    it("should return 400 if password is wrong", async () => {
        const mockUser = { username: "testuser", password: "correctpassword" };
        User.findOne.mockResolvedValue(mockUser); // Mock user found

        const res = await request(app)
            .post("/sign-in")
            .send({ username: "testuser", password: "wrongpassword" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Wrong password");
    });

    it("should authenticate successfully", async () => {
        const mockUser = {
            username: "testuser",
            password: "correctpassword",
            generateAuthToken: jest.fn(),
        };
        const mockMessages = [{ message: "Hello", ipAddress: "127.0.0.1" }];

        User.findOne.mockResolvedValue(mockUser); // Mock user found
        Message.find.mockResolvedValue(mockMessages); // Mock messages found
        mockUser.generateAuthToken.mockReturnValue("mock-token"); // Mock token generation

        const res = await request(app)
            .post("/sign-in")
            .send({ username: "testuser", password: "correctpassword" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("login successful");
        expect(res.body.token).toBe("mock-token");
    });
});
```

---

### 6. Test the `/resetpasscode/:id` Endpoint

This endpoint resets a user’s password.

```javascript
describe("PUT /resetpasscode/:id", () => {
    it("should return 404 if user does not exist", async () => {
        User.findByIdAndUpdate.mockResolvedValue(null); // Mock user not found

        const res = await request(app)
            .put("/resetpasscode/123")
            .send({ password: "newpassword" });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("user doesnt exist");
    });

    it("should update password successfully", async () => {
        const mockUser = { _id: "123", username: "testuser" };
        User.findByIdAndUpdate.mockResolvedValue(mockUser); // Mock user updated

        const res = await request(app)
            .put("/resetpasscode/123")
            .send({ password: "newpassword" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("updated successfully!");
    });
});
```

---

## Run the Tests

Run the tests using:

```bash
npm test
```

---

## Folder Structure

After adding tests, your project structure should look like this:

```
my-next-app/
├── routes/
│   └── index.js
├── models/
│   ├── user.model.js
│   └── message.model.js
├── tests/
│   ├── index.test.js
│   ├── messages.test.js
│   └── auth.test.js
├── __mocks__/
│   ├── user.model.js
│   └── message.model.js
├── jest.config.js
├── package.json
└── ...
```
