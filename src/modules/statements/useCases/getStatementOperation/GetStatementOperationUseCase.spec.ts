import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

describe("Get Statement", () => {
    let statementRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;
    let getStatementUseCase: GetStatementOperationUseCase;

    beforeEach(() => {
        statementRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        getStatementUseCase = new GetStatementOperationUseCase(usersRepository, statementRepository);
    });

    it("should be able to get a statement", async () => {
        const user = await usersRepository.create({
            name: "Myrtle Adams",
            email: "gowjifa@metfam.mx",
            password: "123"
        });

        const statement = await statementRepository.create({
            user_id: user.id || '',
            amount: 200,
            description: "test",
            type: OperationType.DEPOSIT
        });

        const response = await getStatementUseCase.execute({
            user_id: user.id || '',
            statement_id: statement.id || ''
        });

        expect(response).toMatchObject({
            id: expect.any(String),
            user_id: user.id,
            amount: 200,
            description: "test",
            type: OperationType.DEPOSIT,
        });
    });

    it("should not be able to get a statement if user does not exists", async () => {
        await expect(getStatementUseCase.execute({
            user_id: "f8f984ba-9e2d-5972-99c9-38d9755ad512",
            statement_id: "20e6cc04-07e2-569c-92a7-dba7879825ff"
        })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
    });

    it("should not be able to get statement if statement does not exists", async () => {
        const user = await usersRepository.create({
            name: "Myrtle Adams",
            email: "gowjifa@metfam.mx",
            password: "123"
        });

        await expect(getStatementUseCase.execute({
            user_id: user.id || '',
            statement_id: "f488d426-5f51-531b-b530-a7c65176eb84"
        })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
    });
})