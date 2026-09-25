/**
 * Builds the OpenSearch descriptor document, which lets browsers offer
 * Dashy as a keyword search engine, for jumping to items by their alias
 */

/* Must match the title on index.html's <link rel="search">, which browsers check on discovery */
const SHORT_NAME = 'Dashy';

/* Escape a value for safe inclusion in XML text or an attribute */
const xmlEscape = (input) => String(input ?? '').replace(
  /[<>&'"]/g,
  (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]),
);

/* The public origin this request arrived on, honouring a reverse proxy's forwarded headers */
const originFromRequest = (req) => {
  const firstHeader = (name) => (req.headers[name] || '').split(',')[0].trim();
  const proto = firstHeader('x-forwarded-proto') || (req.socket.encrypted ? 'https' : 'http');
  const host = firstHeader('x-forwarded-host') || req.headers.host || 'localhost';
  return `${proto}://${host}`;
};

module.exports = (config, req) => {
  const origin = xmlEscape(originFromRequest(req));
  const title = xmlEscape(config?.pageInfo?.title || SHORT_NAME);
  return `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${SHORT_NAME}</ShortName>
  <Description>Jump to an app on ${title} by its alias</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${origin}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${origin}/{searchTerms}"/>
</OpenSearchDescription>
`;
};
