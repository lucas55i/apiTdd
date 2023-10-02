class LoginRouter {
    route(httpResquest) {
        if (!httpResquest || !httpResquest.body) {
            return HttpResponse.serverError()
        }
        const { email, password } = httpResquest.body
        if (!email) {
            return HttpResponse.badRequest('email')
        }
        if (!password) {
            return HttpResponse.badRequest('password')
        }
    }
}

class HttpResponse {
    static badRequest(paramName) {
        return {
            statusCode: 400,
            body: new MissingParamError(paramName)
        }
    }

    static serverError() {
        return {
            statusCode: 500
        }
    }

}

class MissingParamError extends Error {
    constructor(paramName) {
        super(`Missing param ${paramName}`)
        this.name = 'MissingParamError'
    }
}

describe('Login Router', () => {
    test('Should return 400 if no email is provided', () => {
        const sut = new LoginRouter()
        const httpResquest = {
            body: {
                password: 'any'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return 400 if no password is provided', () => {
        const sut = new LoginRouter()
        const httpResquest = {
            body: {
                email: 'any@hotmail.com'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })


    test('Should return 500 if no httpRequest is provided', () => {
        const sut = new LoginRouter()
        const httpResponse = sut.route()
        expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return 500 if no httpRequest has no body', () => {
        const sut = new LoginRouter()
        const httpResponse = sut.route({})
        expect(httpResponse.statusCode).toBe(500)
    })
})