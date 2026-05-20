import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");
const productListLatency = new Trend("product_list_latency");
const productDetailLatency = new Trend("product_detail_latency");
const homePageLatency = new Trend("home_page_latency");

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

// Load test configuration
export const options = {
  stages: [
    { duration: "30s", target: 10 },    // Warm up
    { duration: "1m", target: 50 },      // Ramp up
    { duration: "3m", target: 100 },     // Sustained load
    { duration: "1m", target: 200 },     // Peak load
    { duration: "30s", target: 0 },      // Cool down
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],   // 95th percentile < 2s
    http_req_failed: ["rate<0.05"],       // Error rate < 5%
    errors: ["rate<0.05"],
  },
};

export default function () {
  group("Homepage", () => {
    const res = http.get(`${BASE_URL}/`);
    homePageLatency.add(res.timings.duration);
    check(res, {
      "homepage status 200": (r) => r.status === 200,
      "homepage loads within 3s": (r) => r.timings.duration < 3000,
    }) || errorRate.add(1);
  });

  sleep(1);

  group("Product Listing", () => {
    const res = http.get(`${BASE_URL}/api/products?page=1&limit=12`);
    productListLatency.add(res.timings.duration);
    check(res, {
      "products status 200": (r) => r.status === 200,
      "products has data": (r) => {
        const body = JSON.parse(r.body as string);
        return body.products !== undefined;
      },
      "products loads within 1s": (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  group("Product Search", () => {
    const queries = ["honey", "organic", "cake", "pickle", "snacks"];
    const query = queries[Math.floor(Math.random() * queries.length)];
    const res = http.get(`${BASE_URL}/api/products?search=${query}&limit=10`);
    check(res, {
      "search status 200": (r) => r.status === 200,
      "search loads within 2s": (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  group("Categories", () => {
    const res = http.get(`${BASE_URL}/api/categories`);
    check(res, {
      "categories status 200": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  group("Recommendations", () => {
    const res = http.get(`${BASE_URL}/api/products/recommendations?type=trending&limit=8`);
    check(res, {
      "recommendations status 200": (r) => r.status === 200,
    }) || errorRate.add(1);
  });

  sleep(0.5);

  group("Health Check", () => {
    const res = http.get(`${BASE_URL}/api/health`);
    check(res, {
      "health check 200": (r) => r.status === 200,
      "is healthy": (r) => JSON.parse(r.body as string).status === "healthy",
    }) || errorRate.add(1);
  });

  sleep(1);
}

export function handleSummary(data: any) {
  return {
    "load-test-results.json": JSON.stringify(data, null, 2),
    stdout: textSummary(data),
  };
}

function textSummary(data: any): string {
  const metrics = data.metrics;
  return `
=== LOAD TEST RESULTS ===
Total Requests: ${metrics.http_reqs?.values?.count || 0}
Failed Requests: ${metrics.http_req_failed?.values?.passes || 0}
Avg Response Time: ${Math.round(metrics.http_req_duration?.values?.avg || 0)}ms
P95 Response Time: ${Math.round(metrics.http_req_duration?.values?.["p(95)"] || 0)}ms
P99 Response Time: ${Math.round(metrics.http_req_duration?.values?.["p(99)"] || 0)}ms
Error Rate: ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%
`;
}
