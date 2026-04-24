import express from 'express';
import bcrypt from 'bcrypt';
import { createClient } from 'redis';

const router = express.Router();
const redisClient = createClient();
await redisClient.connect();

router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password) {
        res.status(400).json({
            error: "Email and password are required"
        });
        return;
    }

    const existingUser = await redisClient.hGetAll(`user:${email}`);
    if(existingUser && existingUser.email) {
        res.status(409).json({
            error: "User already exists"
        });
        return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    await redisClient.hSet(`user:${email}`, {
        id: userId,
        email,
        passwordHash
    });

    res.status(201).json({
        message: "User created successfully", userId
    });

})

export default router;
