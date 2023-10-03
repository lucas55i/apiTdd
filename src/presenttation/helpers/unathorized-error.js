module.exports = class UnathorizedError extends Error {
    constructor(paramName) {
        super('UnathorizedError')
        this.name = 'UnathorizedError'
    }
}