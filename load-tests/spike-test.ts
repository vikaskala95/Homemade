import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Spike test: sudden burst of traffic
export const options = {
  stages: [
    { duration: "10s", target: 10 },     // Normal load
    { duration: "10s", target: 500 },     // Spike!
    { duration: "30s", target: 500 },     // Sustained spike
    { duration: "10s", target: 10 },      // Recovery
    { duration: "30s", target: 10 },      // Post-spike normal
  ],
  thresholds: {
    http_req_duration: ["p(95)<5000"],
    http_req_failed: ["rate<0.1"],
  },
};

export default function () {
  const responses = http.batch([
    ["GET", `${BASE_URL}/api/products?page=1&limit=10`],
    ["GET", `${BASE_URL}/api/categories`],
    ["GET", `${BASE_URL}/api/health`],
  ]);

  responses.forEach((res, i) => {
    check(res, {
      [`batch-${i} status ok`]: (r) => r.status === 200 || r.status === 304,
    });
  });

  sleep(0.1);
}
