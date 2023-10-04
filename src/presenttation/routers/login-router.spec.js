const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnathorizedError = require('../helpers/unathorized-error')
const ServerError = require('../helpers/server-error')

const makeSut = () => {
    const authUseCaseSpy = makeAuthUseCase()
    authUseCaseSpy.accessToken = 'valid_token'
    const sut = new LoginRouter(authUseCaseSpy)
    return {
        sut, authUseCaseSpy
    }
}
const makeAuthUseCase = () => {
    class AuthUseCaseSpy {
        async auth(email, password) {
            this.email = email
            this.password = password
            return this.accessToken // token
        }
    }
    return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
    class AuthUseCaseSpy {
        async auth() {
            throw new Error()
        }
    }
    return new AuthUseCaseSpy()
}

describe('Login Router', () => {
    test('Should return 400 if no email is provided', async () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                password: 'any'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('email'))
    })

    test('Should return 400 if no password is provided', async () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'any@hotmail.com'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })

    test('Should return 401 when invalid credentials are provided', async () => {
        const { sut, authUseCaseSpy } = makeSut()
        authUseCaseSpy.accessToken = null
        const httpResquest = {
            body: {
                email: 'invalid_email@hotmail.com',
                password: 'invalid_password'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(401)
        expect(httpResponse.body).toEqual(new UnathorizedError())

    })
    test('Should return 200 when valid credentials are provided', async() => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'valid@hotmail.com',
                password: 'validPassword'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(200)
    })

    test('Should return 201 when valid credentials are provided', async() => {
        const { sut, authUseCaseSpy } = makeSut()
        const httpResquest = {
            body: {
                email: 'valid@hotmail.com',
                password: 'validPassword'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
    })

    test('Should return 500 if no httpRequest is provided', async() => {
        const { sut } = makeSut()
        const httpResponse = await sut.route()
        expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return 500 if no httpRequest has no body', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.route({})
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should call AuthUseCase with correct params', async() => {
        const { sut, authUseCaseSpy } = makeSut()
        const httpResquest = {
            body: {
                email: 'any@hotmail.com',
                password: 'any123'
            }
        }
        sut.route(httpResquest)
        expect(authUseCaseSpy.email).toBe(httpResquest.body.email)
        expect(authUseCaseSpy.password).toBe(httpResquest.body.password)
    })
    // Testando injeção de dependencias, se caso a classe AuthCaseSpy, 
    // não for informada
    test('Should return 500 if no AuthUseCase is provided', async() => {
        const sut = new LoginRouter()
        const httpResquest = {
            body: {
                email: 'any_email@hotmail.com',
                password: 'any_password'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())

    })
    // Testando injeção de dependencias, se caso a classe AuthCaseSpy, 
    // for informada, mas sem os metodos necessários.
    test('Should return 500 if AuthUseCase has no auth method', async() => {
        const sut = new LoginRouter({})
        const httpResquest = {
            body: {
                email: 'any_email@hotmail.com',
                password: 'any_password'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
        expect(httpResponse.body).toEqual(new ServerError())
    })

    test('Should return 500 if AuthUseCase throws', async() => {
        const authUseCaseSpy = makeAuthUseCaseWithError()
        const sut = new LoginRouter(authUseCaseSpy)
        const httpResquest = {
            body: {
                email: 'any_email@hotmail.com',
                password: 'any_password'
            }
        }
        const httpResponse = await sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
    })
})