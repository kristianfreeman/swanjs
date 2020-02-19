export default class App {
  constructor(event) {
    this._event = event
    this._useBefore = []
    this._middleware = []

    this._ended = false
    this._req = event.request
    this._res = null
  }

  req(newReq) {
    if (newReq) {
      this._req = new Request(this._req, newReq)
    }
    return this._req
  }

  end() {
    if (this._ended) {
      throw new Error("Already ended this request")
    }
    this._ended = true
  }

  res(newRes) {
    if (newRes) {
      this._res = newRes
    }
    return this._res
  }

  useBefore(middleware) {
    this._useBefore.push(middleware)
    return this
  }

  use(middleware) {
    this._middleware.push(middleware)
    return this
  }

  redirect(url, response) {
    const redirectResponse = Response.redirect(url)
    this.res(
      new Response(null, { ...this.res(), ...redirectResponse, ...response })
    )
  }

  async handle() {
    const bail = (url, response) => {
      this.redirect(url, response)
      this.end()
    }

    if (this._useBefore.length) {
      await this._useBefore.reduce(async (previous, cur) => {
        await previous
        if (this._ended) {
          console.log(
            "EDGE CASE: with multiple useBefore's, we should check if a previous useBefore has ended this request, and skip this one"
          )
          return Promise.resolve()
        }
        return cur(this.req.bind(this), this.res.bind(this), {
          event: this._event,
          redirect: bail.bind(this),
        })
      }, Promise.resolve())

      if (this.res() !== null) {
        return this.res()
      }
    }

    console.log("Finished checking for/running useBefores")

    if (this._ended) {
      console.log("useBefore modified response - need to return it")
      return this.res()
    }

    console.log("Starting checking for/running middlewares")
    await this._middleware.reduce(async (previous, cur) => {
      await previous
      if (this._ended) {
        console.log(
          "EDGE CASE: with multiple use's, we should check if a previous middleware has ended this request, and skip this one"
        )
        return Promise.resolve()
      }
      return cur(this.req.bind(this), this.res.bind(this), {
        event: this._event,
        redirect: bail,
      })
    }, Promise.resolve())

    console.log("Finished middlewares")

    console.log("Returning response")
    return this.res()
  }
}
