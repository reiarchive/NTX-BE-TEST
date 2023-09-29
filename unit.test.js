const request = require('supertest');
const app = require('./server');
const jwt = require('jsonwebtoken');
const config = require('./app/config/auth');


describe('Public Endpoint API Test', () => {

    it('should return "Hello" when GET request is made to "/"', async () => {

        const response = await request(app).get('/');

        expect(response.body).toEqual({ message: 'Hello' });

    });

    it('should return object of data when GET request is made to "/api/data/rf1"', async () => {

        const expected = {
            statusCode: 200,
            success: true,
            data: expect.any(Array),
        };

        const response = await request(app).get('/api/data/rf1');
        expect(response.body).toMatchObject(expected);

    });

    it('should return object of data when POST made to /api/data/rf2', async () => {

        const expected = {
            "statusCode": 201,
            "message": "Survey sent successfully!",
            "success": true,
            "data": expect.any(Object)
        }

        const postData = {
            userId: 3,
            values: [100, 200, 300]
        };

        const response = await request(app)
            .post('/api/data/rf2')
            .send(postData)
            .set('Accept', 'application/json');

        expect(response.body).toMatchObject(expected);
    });

});

describe('[aksesGetData] Role endpoint API TEST', () => {
    // aksesCallMeWss
    let token;
    beforeAll(async () => {
        // Generate jwt token
        token = jwt.sign({ email: "azulifirman@gmail.com" }, config.secret, { expiresIn: '1h' });
    });

    it('should return object of data when POST made to /api/data/getdata [ Source Country ]', async () => {

        const expected = {
            "success": true,
            "statusCode": 200,
            "data": {
                "label": expect.any(Array),
                "total": expect.any(Array)
            }
        }

        const postData = {
            "type": "sourceCountry"
        };

        const response = await request(app)
            .post('/api/data/getdata')
            .set('Authorization', token)
            .send(postData);

        expect(response.body).toMatchObject(expected);

    });

    it('should return object of data when POST made to /api/data/getdata [ Destination Country ]', async () => {

        const expected = {
            "success": true,
            "statusCode": 200,
            "data": {
                "label": expect.any(Array),
                "total": expect.any(Array)
            }
        }

        const postData = {
            "type": "destinationCountry"
        };

        const response = await request(app)
            .post('/api/data/getdata')
            .set('Authorization', token)
            .send(postData);

        expect(response.body).toMatchObject(expected);

    });

    it('should return 403 when GET made to /api/data/callmewss', async () => {

        const response = await request(app).get('/api/data/callmewss').set('Authorization', token);
        expect(response.status).toBe(403);

    });

});

describe('[aksesCallMeWss] Role endpoint API TEST', () => {
    // aksesCallMeWss
    let token;
    beforeAll(async () => {
        // Generate jwt token
        token = jwt.sign({ email: "rizkiardiansyah@gmail.com" }, config.secret, { expiresIn: '1h' });
    });

    it('should return 403 when POST made to /api/data/getdata [ Source Country ]', async () => {

        const postData = {
            "type": "sourceCountry"
        };

        const response = await request(app)
            .post('/api/data/getdata')
            .set('Authorization', token)
            .send(postData);

        expect(response.status).toBe(403);

    });

    it('should return 403 when POST made to /api/data/getdata [ Destination Country ]', async () => {

        const postData = {
            "type": "destinationCountry"
        };

        const response = await request(app)
            .post('/api/data/getdata')
            .set('Authorization', token)
            .send(postData);

        expect(response.status).toBe(403);

    });

    it('should return "socket running" when GET made to /api/data/callmewss', async () => {

        const expected = {
            statusCode: 200,
            message: "Socket running!",
            success: true,
        }

        const response = await request(app).get('/api/data/callmewss').set('Authorization', token);

        expect(response.body).toMatchObject(expected);

    });

})