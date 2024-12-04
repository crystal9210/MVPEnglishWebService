// 依存関係
import "reflect-metadata"; // TODO でコレーたが機能するために必要
import { container } from "tsyringe";
import { AuthService } from "@/services/AuthService";
import { FirebaseAdmin } from "@/services/firebaseAdmin";

container.registerSingleton<FirebaseAdmin>("FirebaseAdmin", FirebaseAdmin);
container.registerSingleton<AuthService>(AuthService);
