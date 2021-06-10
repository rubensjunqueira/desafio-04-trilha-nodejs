import supertest from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { Statement } from "../../entities/Statement";
import { GetBalanceError } from "./GetBalanceError";

describe("Balance", () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();

        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should not be able to get user balance if JWT is missing", async () => {
        const balance = await supertest(app)
            .get('/api/v1/statements/balance')
            .set({ Authorization: `Bearer: 7c7f5326-42af-5fee-8bc7-3443bb3429c0` });

        expect(balance.body).toMatchObject({
            message: 'JWT invalid token!'
        });
    });

    it('should not be able to get user balance if JWT is invalid', async () => {
        const balance = await supertest(app)
            .get('/api/v1/statements/balance');

        expect(balance.body).toMatchObject({
            message: 'JWT token is missing!'
        });
    });

    it("should be able to get user balance", async () => {
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

        const balance = await supertest(app)
            .get('/api/v1/statements/balance')
            .set({ Authorization: `Bearer: ${response.body.token}` });

        console.log(balance.body);
        expect(balance.body).toMatchObject({
            balance: expect.any(Number),
            statement: expect.any(Array.bind(Statement))
        });
    });
})