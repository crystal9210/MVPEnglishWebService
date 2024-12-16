import { Memo } from "@/schemas/app/_contexts/memoSchemas";
import { AuthService } from "@/domain/services/authService";
// ApiServiceは命名センスなさすぎ、調整
export class ApiService {
    private apiBase = "/api/memoList";
    private authService: AuthService;

    constructor() {
        this.authService = AuthService
    }

}
