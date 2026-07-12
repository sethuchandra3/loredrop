const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/voice") {
      return new Response(null, { status: 204 });
    }

    let response = await env.ASSETS.fetch(request);
    if (response.status === 404 && request.method === "GET") {
      const acceptsHtml = request.headers.get("Accept")?.includes("text/html");
      if (acceptsHtml) {
        response = await env.ASSETS.fetch(new Request(new URL("/index.html", url), request));
      }
    }

    return response;
  },
};

export default worker;
