import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository"
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

describe("Balance", () => {
    let statementRepository: IStatementsRepository;
    let usersRepository: IUsersRepository;
    let getBalanceUseCase: GetBalanceUseCase;

    beforeEach(() => {
        statementRepository = new InMemoryStatementsRepository();
        usersRepository = new InMemoryUsersRepository();
        getBalanceUseCase = new GetBalanceUseCase(statementRepository, usersRepository);
    });

    it("should not be able to get user balance if user does not exists", async () => {
        await expect(getBalanceUseCase.execute(
            {
                user_id: "938c2bae-734b-57af-b4c3-a01264a23e30"
            })).rejects.toBeInstanceOf(GetBalanceError);
    });

    it("should be able to get user balance", async () => {
        const user = await usersRepository.create({
            name: "Leila Bryan",
            email: "paglo@uwufodfim.pr",
            password: "123"
        });

        const balance = await getBalanceUseCase.execute({
            user_id: user.id || ''
        });
        
        expect(balance).toMatchObject({
            balance: expect.any(Number),
            statement: expect.any(Array.bind(Statement))
        });
    });
})