import supertest from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import { OperationType, Statement } from "../../entities/Statement";

describe("Create Statement", () => {
    let connection: Connection;

    beforeAll(async () => {
        connection = await createConnection();

        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it('should be able to deposit for an user', async () => {
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

        const responseDeposit = await supertest(app)
            .post('/api/v1/statements/deposit')
            .set({ Authorization: `Bearer ${responseAuthUser.body.token}` })
            .send({
                amount: 500,
                description: 'Um depósito de R$ 500,00',
            });

        expect(responseDeposit.body).toMatchObject({
            id: expect.any(String),
            user_id: responseAuthUser.body.user.id,
            amount: 500,
            description: 'Um depósito de R$ 500,00',
            type: OperationType.DEPOSIT,
        });
    });

    it('should not be able to deposit if JWT is invalid', async () => {
        const responseDeposit = await supertest(app)
            .post('/api/v1/statements/deposit')
            .set({ Authorization: `Bearer bd83c095-c00a-5085-a12e-83cc9a017562` })
            .send({
                amount: 500,
                description: 'Um depósito de R$ 500,00'
            });

        expect(responseDeposit.body).toMatchObject({
            message: 'JWT invalid token!'
        });
    });

    it('should not be able to deposit if JWT is missing', async () => {
        const responseDeposit = await supertest(app)
            .post('/api/v1/statements/deposit')
            .send({
                amount: 500,
                description: 'Um depósito de R$ 500,00'
            });

        expect(responseDeposit.body).toMatchObject({
            message: 'JWT token is missing!'
        });
    });

    it('should not be able to withdraw from an user if his balance does not allow', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Andrew Carson',
                email: 'owdodas@megu.sj',
                password: '123'
            });

        const responseAuthUser = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'owdodas@megu.sj',
                password: '123'
            });

        const responseWithdraw = await supertest(app)
            .post('/api/v1/statements/withdraw')
            .set({ Authorization: `Bearer ${responseAuthUser.body.token}` })
            .send({
                amount: 500,
                description: 'Um saque de R$ 500,00'
            });

        expect(responseWithdraw.body).toMatchObject({
            message: 'Insufficient funds',
        });
    });

    it('should be able to withdraw from an user', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Georgie Guzman',
                email: 'ono@maprondi.gt',
                password: '123'
            });

        const responseAuthUser = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'ono@maprondi.gt',
                password: '123'
            });

        await supertest(app)
            .post('/api/v1/statements/deposit')
            .set({ Authorization: `Bearer ${responseAuthUser.body.token}` })
            .send({
                amount: 500,
                description: 'Um depósito de R$ 500,00',
            });

        const responseWithdraw = await supertest(app)
            .post('/api/v1/statements/withdraw')
            .set({ Authorization: `Bearer ${responseAuthUser.body.token}` })
            .send({
                amount: 500,
                description: 'Um saque de R$ 500,00'
            });

        expect(responseWithdraw.body).toMatchObject({
            id: expect.any(String),
            user_id: responseAuthUser.body.user.id,
            amount: 500,
            description: 'Um saque de R$ 500,00',
            type: OperationType.WITHDRAW,
        });
    });

    it('should be able to transfer from user to another user', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Jim Chambers',
                email: 'amnufam@garumuimi.gy',
                password: '123'
            });

        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Sara Griffith',
                email: 'rerfobe@iz.va',
                password: '123'
            });

        const responseAuthUser1 = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'amnufam@garumuimi.gy',
                password: '123'
            });

        const responseAuthUser2 = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'rerfobe@iz.va',
                password: '123'
            });


        await supertest(app)
            .post('/api/v1/statements/deposit')
            .set({ Authorization: `Bearer ${responseAuthUser1.body.token}` })
            .send({
                amount: 500,
                description: 'Um depósito de R$ 500,00',
            });

        const responseTransfer = await supertest(app)
            .post('/api/v1/statements/transfer')
            .set({ Authorization: `Bearer ${responseAuthUser2.body.token}` })
            .send({
                sender_id: responseAuthUser1.body.user.id,
                amount: 500,
                description: `Uma transferência de R$ 500,00 para ${responseAuthUser2.body.user.id}`
            });

        expect(responseTransfer.body).toMatchObject({
            id: expect.any(String),
            user_id: responseAuthUser2.body.user.id,
            sender_id: responseAuthUser1.body.user.id,
            description: expect.any(String),
            type: OperationType.TRANSFER
        });
    });

    it('should not be able to transfer if sender does not have balance', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Maggie Hart',
                email: 'ejoefo@rir.np',
                password: '123'
            });

        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Thomas King',
                email: 'cama@wowegu.sz',
                password: '123'
            });

        const responseAuthUser1 = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'ejoefo@rir.np',
                password: '123'
            });

        const responseAuthUser2 = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'cama@wowegu.sz',
                password: '123'
            });

        const responseTransfer = await supertest(app)
            .post('/api/v1/statements/transfer')
            .set({ Authorization: `Bearer ${responseAuthUser2.body.token}` })
            .send({
                sender_id: responseAuthUser1.body.user.id,
                amount: 500,
                description: `Uma transferência de R$ 500,00 para ${responseAuthUser2.body.user.id}`
            });

        expect(responseTransfer.body).toMatchObject({
            message: 'Insufficient funds'
        });
    });

    it('should able to get statement info', async () => {
        await supertest(app)
            .post('/api/v1/users')
            .send({
                name: 'Ollie Mitchell',
                email: 'abotulib@tiweb.gq',
                password: '123'
            });

        const responseAuthUser1 = await supertest(app)
            .post('/api/v1/sessions')
            .send({
                email: 'abotulib@tiweb.gq',
                password: '123'
            });

        const responseDeposit = await supertest(app)
            .post('/api/v1/statements/deposit')
            .set({ Authorization: `Bearer ${responseAuthUser1.body.token}` })
            .send({
                amount: 500,
                description: 'Um depósito de R$ 500,00',
            });

        const response = await supertest(app)
            .get(`/api/v1/statements/${responseDeposit.body.id}`)
            .set({ Authorization: `Bearer ${responseAuthUser1.body.token}` });

        console.log(response.body);
        expect(response.body).toMatchObject({
            id: expect.any(String),
            user_id: expect.any(String),
            description: expect.any(String),
            amount: expect.any(String),
            type: expect.stringContaining('deposit' || 'transfer' || 'withdraw')
        });
    });
})