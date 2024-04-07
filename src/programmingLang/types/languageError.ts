import {type Token} from "./tokens";

export class LangSyntaxError extends Error {
    name: string
    message: string
    from: number
    to: number
    constructor(errorMessage: string, from: number, to: number) {
        super(errorMessage)
        this.name = "SyntaxError"
        this.message = errorMessage
        this.from = from
        this.to = to
    }
}
export class LangCompileError extends Error {
    name: string
    message: string
    token: Token

    constructor(errorMessage: string, token: Token) {
        super(errorMessage)
        this.name = "CompileError"
        this.message = errorMessage
        this.token = token
    }
}
