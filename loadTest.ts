import http from "k6/http";
import { sleep } from "k6";

export const options = {
    stages: [
        { duration: "30s", target: 50 }, // 30秒間で50リクエスト/秒に増加
        { duration: "1m", target: 50 }, // 1分間50リクエスト/秒を維持
        { duration: "30s", target: 0 }, // 30秒間かけて終了
    ],
};

export default function () {
    const url = "http://localhost/api";

    // 正常系リクエスト
    const payload = JSON.stringify({ key: "value" });
    const params = {
        headers: {
            "Content-Type": "application/json",
            "Content-Length": payload.length.toString(),
        },
    };

    http.post(url, payload, params);

    // 異常系リクエスト
    http.post(url, payload, { headers: { "Content-Type": "text/plain" } });

    sleep(1); // 各リクエストの間に少し間隔を置く
}
