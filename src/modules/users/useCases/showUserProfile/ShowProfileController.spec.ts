import supertest from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { ShowUserProfileError } from "./ShowUserProfileError";

describe("Show Profile", () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();

        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to show an user profile by JWT", async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Charles Aguilar',
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        const responseAuthUser = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'zaloltir@usinop.kg',
                password: '123'
            });

        const responseUserProfile = await supertest(app)
            .get('/api/v1/profile')
            .set({ Authorization: `Bearer ${responseAuthUser.body.token}` });

        expect(responseUserProfile.body).toMatchObject(responseAuthUser.body.user);
    });

    it("should not be able to show an user profile by JWT if JWT is invalid", async () => {
        const responseUserProfile = await supertest(app)
            .get('/api/v1/profile')
            .set({ Authorization: `Bearer 2e6723c4-a46e-5227-b159-e522cc60c852` });

        expect(responseUserProfile.body).toMatchObject({
            message: 'JWT invalid token!'
        });
    });

    it('should not be able to show an user profile by JWT if JWT is missing', async () => {
        const responseUserProfile = await supertest(app)
            .get('/api/v1/profile');            

        expect(responseUserProfile.body).toMatchObject({
            message: 'JWT token is missing!'
        });
    });
})