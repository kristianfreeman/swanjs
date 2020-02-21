import {} from '@cloudflare/workers-types';

const headersToObject = headers => {
  const headersObj = {};
  for (let key of headers.keys()) {
    headersObj[key] = headers[key];
  }
  return headersObj;
};

class MutableRequest implements Request {
  request: Request;
  isHistoryNavigation: boolean;
  isReloadNavigation: boolean;
  keepalive: boolean;
  signal: AbortSignal;

  update({ input, ...args }) {
    this.request = new Request(input, { ...args });
    return this;
  }

  clone(): Request {
    this.request = this.request.clone();
    return this.request;
  }

  get cf() {
    return this.request.cf;
  }

  constructor(input: RequestInfo, init?: RequestInit) {
    this.request = new Request(input, init);
  }

  get cache() {
    return this.request.cache;
  }

  get ip() {
    return this.request;
  }

  get credentials() {
    return this.request.credentials;
  }

  get destination() {
    return this.request.destination;
  }

  get headers() {
    return this.request.headers;
  }

  set headers(newHeaders: Headers) {
    let headers = Object.assign(
      {},
      headersToObject(this.request.headers),
      newHeaders
    );

    const newRequest = new Request(this.request, {
      headers
    });

    this.request = newRequest;
  }

  get integrity() {
    return this.request.integrity;
  }

  get method() {
    return this.request.method;
  }

  get mode() {
    return this.request.mode;
  }

  get redirect() {
    return this.request.redirect;
  }

  get referrer() {
    return this.request.referrer;
  }

  get referrerPolicy() {
    return this.request.referrerPolicy;
  }

  get url() {
    return this.request.url;
  }

  get arrayBuffer() {
    return this.request.arrayBuffer;
  }

  get blob() {
    return this.request.blob;
  }

  get formData() {
    return this.request.formData;
  }

  get json() {
    return this.request.json;
  }

  get text() {
    return this.request.text;
  }

  get body(): ReadableStream<Uint8Array> {
    return this.request.body;
  }

  set body(newBody: ReadableStream<Uint8Array>) {
    const newRequest = new Request(this.request, { body: newBody });
    this.request = newRequest;
  }

  get bodyUsed() {
    return this.request.bodyUsed;
  }
}

class MutableResponse implements Response {
  response: Response;

  constructor(input: BodyInit, init?: ResponseInit) {
    this.response = new Response(input, init);
  }

  update({ body, ...args }) {
    this.response = new Response(body, { ...args });
    return this;
  }

  get headers() {
    return this.response.headers;
  }

  get ok() {
    return this.response.ok;
  }

  get redirected() {
    return this.response.redirected;
  }

  get status() {
    return this.response.status;
  }

  get statusText() {
    return this.response.statusText;
  }

  get trailer() {
    return this.response.trailer;
  }

  get type() {
    return this.response.type;
  }

  get url() {
    return this.response.url;
  }

  get clone() {
    return this.response.clone;
  }

  get body() {
    return this.response.body;
  }

  get bodyUsed() {
    return this.response.bodyUsed;
  }

  get arrayBuffer() {
    return this.response.arrayBuffer;
  }

  get blob() {
    return this.response.blob;
  }

  get formData() {
    return this.response.formData;
  }

  get json() {
    return this.response.json;
  }

  get text() {
    return this.response.text;
  }
}

export { MutableRequest as Request, MutableResponse as Response };
