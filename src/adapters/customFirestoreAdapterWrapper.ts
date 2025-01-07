import { container } from "tsyringe";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";
import { CustomFirestoreAdapter } from "@/adapters/customFirestoreAdapter";
import { Adapter } from "next-auth/adapters";

export function CustomFirestoreAdapterWrapper(): Adapter {
    // get an instance from the tsyringe container.
    const adapterInstance = container.resolve<CustomFirestoreAdapter>(
        TSYRINGE_TOKENS.CustomFirestoreAdapter
    );

    // bind each method and return it as a pure object.
    return {
        createUser: adapterInstance.createUser.bind(adapterInstance),
        getUser: adapterInstance.getUser.bind(adapterInstance),
        getUserByEmail: adapterInstance.getUserByEmail.bind(adapterInstance),
        getUserByAccount:
            adapterInstance.getUserByAccount.bind(adapterInstance),
        updateUser: adapterInstance.updateUser.bind(adapterInstance),
        deleteUser: adapterInstance.deleteUser.bind(adapterInstance),
        linkAccount: adapterInstance.linkAccount.bind(adapterInstance),
        unlinkAccount: adapterInstance.unlinkAccount.bind(adapterInstance),
        createSession: adapterInstance.createSession.bind(adapterInstance),
        getSessionAndUser:
            adapterInstance.getSessionAndUser.bind(adapterInstance),
        updateSession: adapterInstance.updateSession.bind(adapterInstance),
        deleteSession: adapterInstance.deleteSession.bind(adapterInstance),
        createVerificationToken:
            adapterInstance.createVerificationToken.bind(adapterInstance),
        useVerificationToken:
            adapterInstance.useVerificationToken.bind(adapterInstance),
        getAuthenticator:
            adapterInstance.getAuthenticator.bind(adapterInstance),
        createAuthenticator:
            adapterInstance.createAuthenticator.bind(adapterInstance),
        listAuthenticatorsByUserId:
            adapterInstance.listAuthenticatorsByUserId.bind(adapterInstance),
        updateAuthenticatorCounter:
            adapterInstance.updateAuthenticatorCounter.bind(adapterInstance),
    };
}
