// // TODO
// import { IdGenerator } from "@/utils/generators/idGenerator";
// import { IdManager } from "@/utils/generators/idManager";
// import { LocalStorageProvider } from "../repositories/clientSide/localStorageRepository";
// import { SecureLocalStorageProvider } from "../repositories/clientSide/secureLocalStorageRepository";
// import { IIndexedDBManager } from "@/interfaces/clientSide/repositories/managers/IIndexedDBManager";
// // import { FirestoreProvider } from "@/storage/FirestoreProvider";

// type StorageType = "LocalStorage" | "SecureLocalStorage" | "IndexedDB" | "Firestore";



// interface IdManagerConfig {
//     storageType: StorageType;
//     secureMode?: boolean;
//     maxRetries?: number;
// }

// export class IdManagerService {
//     private idManager: IdManager;

//     constructor(config: IdManagerConfig) {
//         const idGenerator = new IdGenerator("Asia/Tokyo");
//         let storageProvider;

//         switch (config.storageType) {
//             case "LocalStorage":
//                 storageProvider = new LocalStorageProvider();
//                 break;
//             case "SecureLocalStorage":
//                 storageProvider = new SecureLocalStorageProvider();
//                 break;
//             case "IndexedDB":
//                 storageProvider: IIndexedDBManager;
//                 break;
//             // case "Firestore":
//             //     storageProvider = new FirestoreProvider();
//                 break;
//             default:
//                 throw new Error("Unsupported storage type");
//         }

//         this.idManager = new IdManager(
//             idGenerator,
//             storageProvider,
//             config.maxRetries,
//             config.secureMode || false
//         );

//         if (config.secureMode) {
//             this.idManager.enableSecureMode();
//         }
//     }

//     getIdManager(): IdManager {
//         return this.idManager;
//     }
// }


// // --- use case sample ---
// // src/app.ts
// // import { IdManagerService } from "@/services/IdManagerService";

// // async function main() {
// //     const config = {
// //         storageType: "SecureLocalStorage" as const,
// //         secureMode: true,
// //         maxRetries: 100
// //     };

// //     const idManagerService = new IdManagerService(config);
// //     const idManager = idManagerService.getIdManager();

// //     try {
// //         const sessionId = await idManager.generateUniqueSessionId();
// //         console.log("Generated Session ID:", sessionId);
// //     } catch (error) {
// //         console.error("Error generating Session ID:", error);
// //     }
// // }

// // main();
