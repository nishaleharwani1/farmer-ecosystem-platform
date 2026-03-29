const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Agro Innovator API Testing', () => {

    afterAll(() => {
        // Close DB after all tests to prevent open handle errors
        db.close();
    });

    it('GET /api/health should return a health check message', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Agro Innovator Backend is running successfully!');
    });

    it('POST /api/auth/register should fail if fields are missing', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com' });
        
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('All fields are required.');
    });

    it('GET /api/crops should fetch available crops list', async () => {
        const response = await request(app).get('/api/crops');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBeTruthy();
    });

});
