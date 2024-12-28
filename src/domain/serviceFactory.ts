import { container } from "tsyringe";

export class ServiceFactory {
    getService<T>(serviceIndentifier: string): T {
        return container.resolve(serviceIndentifier);
    }
}

// --- use case sample code ---
// import { ServiceFactory } from "./serviceFactory";

// export class ApiController {
//   private serviceFactory: ServiceFactory;

//   constructor() {
//     this.serviceFactory = new ServiceFactory();
//   }

//   async handleRequest(serviceName: string, params: Record<string, unknown>) {
//     const service = this.serviceFactory.getService(serviceName);
//     const result = await service.execute(params);
//     return result;
//   }
// }

// // 使用例
// const apiController = new ApiController();
// const userResult = await apiController.handleRequest("user", { userId: "123" });
// console.log(userResult); // { name: "John Doe", age: 30 }

// const statisticsResult = await apiController.handleRequest("statistics", { userId: "123", period: "monthly" });
// console.log(statisticsResult); // { totalSessions: 42 }
