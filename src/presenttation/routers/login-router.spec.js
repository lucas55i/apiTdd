const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnathorizedError = require('../helpers/unathorized-error')

const makeSut = () => {
    // Mock para LogiRouter()
    class AuthUseCaseSpy {
        auth(email, password) {
            this.email = email
            this.password = password
            return this.accessToken // token
        }
    }
    const authUseCaseSpy = new AuthUseCaseSpy()
    authUseCaseSpy.accessToken = 'valid_token'
    const sut = new LoginRouter(authUseCaseSpy)
    return {
        sut, authUseCaseSpy
    }
}

describe('Login Router', () => {
    test('Should return 400 if no email is provided', () => {
        const { sut } = makeSut()
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
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'any@hotmail.com'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(400)
        expect(httpResponse.body).toEqual(new MissingParamError('password'))
    })

    test('Should return 401 when invalid credentials are provided', () => {
        const { sut, authUseCaseSpy } = makeSut()
        authUseCaseSpy.accessToken = null
        const httpResquest = {
            body: {
                email: 'invalid_email@hotmail.com',
                password: 'invalid_password'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(401)
        expect(httpResponse.body).toEqual(new UnathorizedError())

    })
    test('Should return 200 when valid credentials are provided', () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'valid@hotmail.com',
                password: 'validPassword'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(200)
    })

    test('Should return 201 when valid credentials are provided', () => {
        const { sut, authUseCaseSpy } = makeSut()
        const httpResquest = {
            body: {
                email: 'valid@hotmail.com',
                password: 'validPassword'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(200)
        expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
    })

    test('Should return 500 if no httpRequest is provided', () => {
        const { sut } = makeSut()
        const httpResponse = sut.route()
        expect(httpResponse.statusCode).toBe(500)
    })

    test('Should return 500 if no httpRequest has no body', () => {
        const { sut } = makeSut()
        const httpResponse = sut.route({})
        expect(httpResponse.statusCode).toBe(500)
    })

    test('Should call AuthUseCase with correct params', () => {
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
    test('Should return 500 if no AuthUseCase is provided', () => {
        const sut = new LoginRouter()
        const httpResquest = {
            body: {
                email: 'any_email@hotmail.com',
                password: 'any_password'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
    })
    // Testando injeção de dependencias, se caso a classe AuthCaseSpy, 
    // for informada, mas sem os metodos necessários.
    test('Should return 500 if AuthUseCase has no auth method', () => {
        const sut = new LoginRouter({})
        const httpResquest = {
            body: {
                email: 'any_email@hotmail.com',
                password: 'any_password'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(500)
    })
})