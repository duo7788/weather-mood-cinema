const getRequestUrl = (request) => {
  const protocol = request.headers["x-forwarded-proto"] || "https";
  const host = request.headers.host || "localhost";
  return new URL(request.url || "/", `${protocol}://${host}`);
};

export const createVercelHandler = (webHandler) => async (request, response) => {
  const webRequest = new Request(getRequestUrl(request), {
    method: request.method,
    headers: request.headers,
  });

  const webResponse = await webHandler(webRequest);

  response.status(webResponse.status);
  webResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });
  response.send(await webResponse.text());
};
