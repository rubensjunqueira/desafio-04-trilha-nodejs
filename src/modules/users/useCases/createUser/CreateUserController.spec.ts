import supertest from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { CreateUserError } from "./CreateUserError";

describe('Create User', () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();

        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it('should be able to create an new user', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            })
            .expect(201);
    });

    it('should not be able to create an new user if email already exists', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        const response = await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        expect(response.status).toBe(400);
        expect(response.body).toMatchObject({
            message: 'User already exists'
        });
    });
});