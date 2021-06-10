import supertest from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

describe("Authenticate User Controller", () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();

        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });


    it("should able to authenticate an user", async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        const response = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        expect(response.body).toMatchObject({
            user: expect.objectContaining({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                id: expect.any(String),
            }),
            token: expect.any(String)
        });
    });

    it("should not be able to authenticate an user if email does not exists", async () => {

        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        const response = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'ab@gu.ye',
                password: '123'
            });

        expect(response.body).toMatchObject({
            message: "Incorrect email or password"
        });
    });

    it("should not be able to authenticate an user if password is not match", async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

         const response = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'zaloltir@usinop.kg',
                password: '1231S2'
            });

        expect(response.body).toMatchObject({
            message: "Incorrect email or password"
        });
    });
});