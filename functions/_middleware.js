export async function onRequest(context) {
  const { request, next } = context;
  const res = await next();
  const { pathname } = new URL(request.url);

  if (!(pathname === "/index.html" || pathname === "/")) {
    return res;
  }

  const ogtag = `
    <meta property="og:title" content="KB Labs | Development Agency" />
    <meta property="og:description" content="Innovating at the intersection of AI, Security, Software Engineering, and Data." />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${request.url}" />
    <meta property="og:image" content="https://kblabs.us/img/preview.png" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:width" content="1200" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="KB Labs | Development Agency" />
    <meta name="twitter:description" content="Innovating at the intersection of AI, Security, Software Engineering, and Data." />
  `;

  class ElementHandler {
    constructor(content) {
      this.content = content;
    }
    element(element) {
      element.append(this.content, { html: true });
    }
  }

  return new HTMLRewriter()
    .on("head", new ElementHandler(ogtag))
    .transform(res);
}
