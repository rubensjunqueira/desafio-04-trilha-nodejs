import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

describe("Create User", () => {
    let usersRepository: IUsersRepository;
    let createUserUseCase: CreateUserUseCase;

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        createUserUseCase = new CreateUserUseCase(usersRepository);
    })

    it("should be able to create a new user", async () => {
        const user = await createUserUseCase.execute({
            name: "Gussie Mullins",
            email: "ocihez@zapsoglad.vu",
            password: "1234"
        });

        expect(user).toHaveProperty("id");
        expect(user).toMatchObject(expect.objectContaining({...user}));
    });

    it("should not be able to create a new user if email already exists", async () => {
        const alreadyExistsUser = await usersRepository.create({
            name: "Gussie Mullins",
            email: "ocihez@zapsoglad.vu",
            password: "1234"
        });

        await expect(
            createUserUseCase.execute({
                name: alreadyExistsUser.name,
                email: alreadyExistsUser.email,
                password: "1234"
            })).rejects.toBeInstanceOf(CreateUserError);
    });
});