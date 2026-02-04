const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('../routes/auth');

const app = express();
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);

// Mock DB
jest.mock('../config/db', () => ({
    query: jest.fn()
}));

const db = require('../config/db');
const bcrypt = require('bcryptjs');

describe('Auth API', () => {
    it('should register a new user', async () => {
        db.query.mockResolvedValueOnce([[]]); // No existing user
        db.query.mockResolvedValueOnce([{ insertId: 1 }]); // Insert success

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should not register existing user', async () => {
        db.query.mockResolvedValueOnce([[{ id: 1 }]]); // Existing user

        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });
});
