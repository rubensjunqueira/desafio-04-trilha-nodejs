import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository"
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

describe("Show Profile", () => {
    let usersRepository: IUsersRepository;
    let showProfileUseCase: ShowUserProfileUseCase;

    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository();
        showProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    });

    it("should be able to show an user profile by Id", async () => {
        const user = await usersRepository.create({
            name: "Gussie Mullins",
            email: "ocihez@zapsoglad.vu",
            password: "1234"
        });

        const userProfile = await showProfileUseCase.execute(user.id || '');

        expect(userProfile).toMatchObject(user);
    });

    it("should not be able to show an user profile by Id if user does not exists", async () => {
        await expect(showProfileUseCase.execute('a1036b5a-3269-51ca-87c1-aceffe0a9eb4'))
        .rejects.toBeInstanceOf(ShowUserProfileError);        
    });
})