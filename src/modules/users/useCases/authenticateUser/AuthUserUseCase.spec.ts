import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

describe("Authenticate User", () => {
    let usersRepository: IUsersRepository;
    let authUserUseCase: AuthenticateUserUseCase;
    let createUserUseCase: CreateUserUseCase;

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(usersRepository);
        authUserUseCase = new AuthenticateUserUseCase(usersRepository);
    });

    it("should able to authenticate an user", async () => {
        const user = await createUserUseCase.execute({
            name: "Alvin Munoz",
            email: "lolutfa@soitnu.nc",
            password: "123"
        });

        const response = await authUserUseCase.execute({
            email: "lolutfa@soitnu.nc",
            password: "123"
        });

        expect(response).toMatchObject({
            user: expect.objectContaining({
                name: user.name,
                email: user.email,
                id: expect.any(String),
            }),
            token: expect.any(String)
        });
    });

    it("should not be able to authenticate an user if email does not exists", async () => {
        await expect(authUserUseCase.execute({
            email: "lolutfa@soitnu.nc",
            password: "123"
        })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });

    it("should not be able to authenticate an user if password is not match", async () => {
        const user = await createUserUseCase.execute({
            name: "Mae Rice",
            email: "he@noci.sy",
            password: "123"
        });

        await expect(authUserUseCase.execute({
            email: user.email,
            password: "868329646"
        })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
    });
});