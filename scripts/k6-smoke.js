import http from "k6/http";
import { check, sleep } from "k6";

const baseUrl = __ENV.K6_BASE_URL || "http://localhost:3000";

export const options = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<750"],
  },
  scenarios: {
    smoke: {
      executor: "constant-vus",
      vus: Number(__ENV.K6_VUS || 5),
      duration: __ENV.K6_DURATION || "1m",
    },
  },
};

export default function () {
  const live = http.get(`${baseUrl}/live`);
  check(live, {
    "liveness is ok": (response) => response.status === 200,
  });

  const ready = http.get(`${baseUrl}/ready`);
  check(ready, {
    "readiness is 2xx or 503": (response) =>
      (response.status >= 200 && response.status < 300) ||
      response.status === 503,
  });

  sleep(1);
}
