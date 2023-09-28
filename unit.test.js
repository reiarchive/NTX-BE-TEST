const request = require('supertest');
const { app, server } = require('./server');
// const { expect } = require('chai');

async function delayedFunction() {
    // Wait for 3 seconds (3000 milliseconds) before running the actual code
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Your code here...
}


describe('Endpoint API Testing', () => {

    beforeAll(async () => {
        await app.sequelizeReady;
        await delayedFunction();
    });

    afterAll(async () => {
        await server.close();
    })


    it('should return "Hello" when GET request is made to "/"', async () => {

        const response = await request(app).get('/');

        expect(response.body).toEqual({ message: 'Hello' });

    });

    it('should return object of data when GET request is made to "/api/data/rf1"', async () => {

        const expected = {
            statusCode: 200,
            success: true,
            data: expect.any(Array), // This matches any array, regardless of its content
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

    it('should return object of data when POST made to /api/data/getdata [ Source Country ] Test', async () => {

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
            .send(postData)
            .set('Accept', 'application/json');

        expect(response.body).toMatchObject(expected);

    });

    // ss

    // it('should return object of data when POST made to /api/data/getdata [ Source Country ]', async () => {

    //     const expected = {
    //         "success": true,
    //         "statusCode": 200,
    //         "data": {
    //             "label": expect.any(Array),
    //             "total": expect.any(Array)
    //         }
    //     }

    //     const postData = {
    //         "type": "sourceCountry"
    //     };

    //     const response = await request(app)
    //         .post('/api/data/getdata')
    //         .send(postData)
    //         .set('Accept', 'application/json');

    //     expect(response.body).toMatchObject(expected);
    // });

    // it('should return object of data when POST made to /api/data/getdata [ Destination Country ] ', async () => {

    //     const expected = {
    //         "success": true,
    //         "statusCode": 200,
    //         "data": {
    //             "label": expect.any(Array),
    //             "total": expect.any(Array)
    //         }
    //     }

    //     const postData = {
    //         "type": "destinationCountry"
    //     };

    //     const response = await request(app)
    //         .post('/api/data/getdata')
    //         .send(postData)
    //         .set('Accept', 'application/json');

    //     expect(response.body).toMatchObject(expected);
    // });

})