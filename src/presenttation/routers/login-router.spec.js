const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')

const makeSut = () => {
    // Mock para LogiRouter()
    class AuthUseCaseSpy {
        auth(email, password) { 
            this.email = email
            this.password = password
        }
    }
    const authUseCaseSpy = new AuthUseCaseSpy()
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

    test('Should return 401 when invalid credentials are provided', () => {
        const { sut } = makeSut()
        const httpResquest = {
            body: {
                email: 'invalid_email@hotmail.com',
                password: 'invalid_password'
            }
        }
        const httpResponse = sut.route(httpResquest)
        expect(httpResponse.statusCode).toBe(401)
    })
})