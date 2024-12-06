// TODO expressは今回の選定内容(特にnode.js)に適合するか調査、そして今回の要件を満たしつつ全体の最適化
// TODO(要件) cors,csp,cookie(where jwt is hold in https communication (ex: Authorization, Bearer) )



// --- sample code1 ---
// import express from 'express';
// import cors from 'cors';
// import { errorHandler } from '@/middleware/errorHandler';
// import apiRoutes from '@/routes/api';

// const app = express();

// app.use(cors({
//     origin: 'https://yourdomain.com',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(express.json());

// // ルート設定
// app.use('/api', apiRoutes);

// // エラーハンドリングミドルウェアの使用
// app.use(errorHandler);

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// });



// --- sample code2 ---
// import helmet from 'helmet';

// app.use(helmet());
