import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

describe("Create Statement", () => {
    let statementRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;
    let createStatementUseCase: CreateStatementUseCase;

    beforeEach(() => {
        statementRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        createStatementUseCase = new CreateStatementUseCase(usersRepository, statementRepository);
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
})