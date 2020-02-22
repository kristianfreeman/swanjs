import {
  Request as MutableRequest,
  Response as MutableResponse
} from '@swandotjs/swap';

type MiddlewareUtils = {
  redirect: (Response) => Promise<void>;
};

type Middleware = (
  MutableRequest,
  MutableResponse,
  MiddlewareUtils
) => Promise<void>;

type AppOptions = {
  logger?: Function;
};

export default class App {
  _event: FetchEvent;
  _useBefore: Array<Middleware>;
  _middleware: Array<Middleware>;
  _ended: boolean;
  _req: MutableRequest;
  _res?: MutableResponse;

  log: Function;

  constructor(event, opts: AppOptions = {}) {
    this._event = event;
    this._useBefore = [];
    this._middleware = [];
    this.log = opts.logger ? opts.logger : console.log;

    this._ended = false;
    this._req = event.request;
    this._res = new MutableResponse(null);
  }

  get req() {
    return this._req;
  }

  end() {
    if (this._ended) {
      throw new Error('Already ended this request');
    }
    this._ended = true;
  }

  get res() {
    return this._res;
  }

  useBefore(middleware) {
    this._useBefore.push(middleware);
    return this;
  }

  use(middleware) {
    this._middleware.push(middleware);
    return this;
  }

  redirect(url, response) {
    const redirectResponse = Response.redirect(url);
    this.res.update({
      body: redirectResponse.body,
      ...redirectResponse,
      ...response
    });
  }

  async handle() {
    const bail = (url, response) => {
      this.redirect(url, response);
      this.end();
    };

    if (this._useBefore.length) {
      await this._useBefore.reduce(async (previous, cur) => {
        await previous;
        if (this._ended) {
          console.log(
            "EDGE CASE: with multiple useBefore's, we should check if a previous useBefore has ended this request, and skip this one"
          );
          return Promise.resolve();
        }
        return cur(this.req, this.res, {
          event: this._event,
          redirect: bail.bind(this)
        });
      }, Promise.resolve());

      if (this.res !== null) {
        return this.res.response;
      }
    }
    if (this._ended) {
      return this.res.response;
    }

    await this._middleware.reduce(async (previous, cur) => {
      await previous;
      if (this._ended) {
        console.log(
          "EDGE CASE: with multiple use's, we should check if a previous middleware has ended this request, and skip this one"
        );
        return Promise.resolve();
      }
      return cur(this.req, this.res, {
        event: this._event,
        redirect: bail
      });
    }, Promise.resolve());

    const url = new URL(this.req.url);
    try {
      this.log({
        hostname: url.hostname,
        ip: this.req.ip,
        method: this.req.method,
        url,
        status: this.res.status
      });
    } catch (err) {
      this.log({ status: 'error', message: err.toString() });
    }
    return this.res.response;
  }
}
