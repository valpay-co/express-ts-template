# Express.js + TypeScript Coding Guidelines 🚀

These guidelines ensure **consistency, maintainability, and scalability** in TypeScript-based Express.js applications.

---

## 📂 1. Project Structure

Recommended folder structure:

```
/project-root
│── /src
│   │── /config         # Configuration & environment variables
│   │── /controllers    # Route controllers
│   │── /middlewares    # Custom middlewares (auth, logging, validation)
│   │── /routes         # Express route definitions
│   │── /services       # Business logic & external API integrations
│   │── /models         # Database models (MongoDB, SQL, etc.)
│   │── /utils          # Utility functions/helpers
│   │── /factories      # Payload & Response factories
│   │── /daos           # Data Access Layer (DAO pattern)
│   │── /tests          # Unit & integration tests
│   └── app.ts          # Express app setup
│── /public             # Static assets
│── /logs               # Log files
│── tsconfig.json       # TypeScript configuration
│── package.json        # Dependencies & scripts
│── README.md           # Documentation
│── .eslintrc.js        # Linter config
│── .prettierrc         # Formatter config
│── .env                # Environment variables
```

---

## ⚙️ 2. Express Application Setup (TypeScript)

### `app.ts` (App Configuration)

```typescript
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Routes
app.use('/api', routes);

export default app;
```

### `server.ts` (Starting the Server)

```typescript
import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
```

---

## 🛤️ 3. Routing Best Practices

**Define routes separately in `/routes/`, delegating work to controllers.**

### Example: `routes/userRoutes.ts`

```typescript
import express from 'express';
import userController from '../controllers/userController';
import validateUser from '../middlewares/validateUser';

const router = express.Router();

router.get('/', userController.getUsers);
router.post('/', validateUser, userController.createUser);

export default router;
```

---

## 🎯 4. Controllers

Controllers should contain minimal logic and delegate work to the **service layer**.

### Example: `controllers/userController.ts`

```typescript
import { Request, Response } from 'express';
import userService from '../services/userService';

const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const newUser = await userService.createUser(req.body);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export default { getUsers, createUser };
```

---

## 🏗️ 5. Service Layer

Business logic should be encapsulated in services.

### Example: `services/userService.ts`

```typescript
import userDAO from '../daos/userDAO';

const getAllUsers = async () => {
    return await userDAO.findAll();
};

const createUser = async (userData: { name: string; email: string; password: string }) => {
    return await userDAO.create(userData);
};

export default { getAllUsers, createUser };
```

---

## 💾 6. DAO (Database Access Object) Layer

Database queries should be handled separately in **DAOs**.

### Example: `daos/userDAO.ts`

```typescript
import User from '../models/User';

const findAll = async () => {
    return await User.find();
};

const create = async (userData: { name: string; email: string; password: string }) => {
    return await User.create(userData);
};

export default { findAll, create };
```

---

## 🛡️ 7. Middleware Best Practices

### Example: `middlewares/validateUser.ts`

```typescript
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const validateUser = [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 6 }).withMessage('Password too short'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

export default validateUser;
```

---

## 🔧 8. Error Handling

Use a centralized **error handler** to manage all errors.

### Example: `middlewares/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack);
    res.status(500).json({ message: err.message || "Internal Server Error" });
};

export default errorHandler;
```

---

## 📜 9. Environment Variables & Config

Store all secrets in `.env` and avoid hardcoding them.

### Example `.env`

```
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=mysecretkey
```

---

## 📊 10. Logging

Use **Winston** for structured logging.

### Example: `utils/logger.ts`

```typescript
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/app.log' })
    ],
});

export default logger;
```

---

## 🧪 11. Testing Strategy

Use **Jest & Supertest** for API testing.

### Install Dependencies

```bash
npm install --save-dev jest supertest @types/jest @types/supertest ts-jest
```

### Example Test: `tests/user.test.ts`

```typescript
import request from 'supertest';
import app from '../app';

describe('User API', () => {
    it('should return all users', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
```

---

## ✅ Final Checklist

✅ Use **Controllers for request handling**  
✅ Use **Services for business logic**  
✅ Use **DAOs for database operations**  
✅ Use **Middleware for validation, logging, and authentication**  
✅ Use **Centralized error handling**  
✅ Use **Structured logging with Winston**  
✅ Write **unit and integration tests**  

Would you like a **TypeScript starter template repo for this?** 🚀
