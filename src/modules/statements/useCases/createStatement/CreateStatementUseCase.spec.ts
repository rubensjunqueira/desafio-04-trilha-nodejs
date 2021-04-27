import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statement", () => {
    let statementRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;
    let createStatementUseCase: CreateStatementUseCase;
    let getBalanceUseCase: GetBalanceUseCase;


    beforeEach(() => {
        statementRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementRepository);
        getBalanceUseCase = new GetBalanceUseCase(statementRepository, usersRepository);
    });

    it("should be able to create a new statement", async () => {
        const user = await usersRepository.create({
            name: "Myrtle Adams",
            email: "gowjifa@metfam.mx",
            password: "123"
        });

        const response = await createStatementUseCase.execute({
            user_id: user.id || '',
            amount: 200,
            description: "test",
            type: OperationType.DEPOSIT
        });

        expect(response).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            amount: 200,
            description: "test",
            type: OperationType.DEPOSIT,
        });
    });

    it("should not be able to create a new statement if user does not exists", async () => {
        await expect(createStatementUseCase.execute({
            user_id: "12c41b43-299c-53e4-8657-75e1fe7cbd36",
            amount: 200,
            description: "test",
            type: OperationType.WITHDRAW
        })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });

    it("should not be able to create a witdraw statement if balance less than amount", async () => {
        const user = await usersRepository.create({
            name: "Myrtle Adams",
            email: "gowjifa@metfam.mx",
            password: "123"
        });

        await expect(createStatementUseCase.execute({
            user_id: user.id || '',
            amount: 200,
            description: "test",
            type: OperationType.WITHDRAW
        })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });

    it("should be able to make a transfer for another user", async () => {
        const user1 = await usersRepository.create({
            name: "Myrtle Adams",
            email: "gowjifa@metfam.mx",
            password: "123"
        });

        await statementRepository.create({
            user_id: user1.id || '',
            amount: 200,
            description: "deposit",
            type: OperationType.DEPOSIT
        });

        const user2 = await usersRepository.create({
            name: "Birdie Lambert",
            email: "ru@juwtap.sl",
            password: "123"
        });

        await createStatementUseCase.execute({
            sender_id: user1.id,
            user_id: user2.id || '',
            amount: 100,
            description: "transferência user 1 para user 2",
            type: OperationType.TRANSFER
        });

        const balance_user1 = await getBalanceUseCase.execute({
            user_id: user1.id || ''
        });

        const balance_user2 = await getBalanceUseCase.execute({
            user_id: user2.id || ''
        });

        // console.log("Balance user1: ", balance_user1);
        // console.log("Balance user2: ", balance_user2);
        
        expect(balance_user1).toMatchObject({
            balance: 100,
            statement: expect.any(Array.bind(Statement))
        });
        expect(balance_user2).toMatchObject({
            balance: 100,
            statement: expect.any(Array.bind(Statement))
        });
    });

    it("should not be able to transfer from a nonexistent user", async () => {
        const user2 = await usersRepository.create({
            name: "Ricardo Nash",
            email: "fo@ve.mg",
            password: "12345"
        });

        await expect(createStatementUseCase.execute({
            // sender_id: '92d4830f-9725-5273-9b69-401845923838',
            user_id: user2.id || '',
            amount: 100,
            description: "transfêrencia do usuário 1 para o usuário 2",
            type: OperationType.TRANSFER
        })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
    });

    it("should not be able to transfer to user if balance less than amount", async () => {
        const user1 = await usersRepository.create({
            name: "Myrtle Adams",
            email: "gowjifa@metfam.mx",
            password: "123"
        });

        const user2 = await usersRepository.create({
            name: "Ricardo Nash",
            email: "fo@ve.mg",
            password: "12345"
        });

        await expect(createStatementUseCase.execute({
            sender_id: user1.id,
            user_id: user2.id || '',
            amount: 200,
            description: "transferência do usuário 1 para usuário 2",
            type: OperationType.TRANSFER
        })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
    });
});