import assert from "node:assert/strict";
import test from "node:test";

import { createVercelHandler } from "../api/vercel-adapter.mjs";

const createResponseMock = () => {
  const headers = new Map();

  return {
    body: undefined,
    headers,
    statusCode: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, value) {
      headers.set(key.toLowerCase(), value);
    },
    send(body) {
      this.body = body;
    },
  };
};

test("adapts Vercel requests to the shared Web Response handlers", async () => {
  const handler = createVercelHandler(async (request) => {
    const url = new URL(request.url);

    return new Response(
      JSON.stringify({
        method: request.method,
        city: url.searchParams.get("city"),
        host: url.host,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });

  const response = createResponseMock();

  await handler(
    {
      method: "GET",
      url: "/api/weather-mood?city=Shanghai",
      headers: {
        host: "weather-mood-cinema.vercel.app",
        "x-forwarded-proto": "https",
      },
    },
    response,
  );

  assert.equal(response.statusCode, 201);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.deepEqual(JSON.parse(response.body), {
    method: "GET",
    city: "Shanghai",
    host: "weather-mood-cinema.vercel.app",
  });
});
