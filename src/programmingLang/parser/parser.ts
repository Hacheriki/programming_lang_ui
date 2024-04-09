import {type Token, TokenType} from '../types/tokens'
import type {
    BinaryExpression,
    Expression,
    FloatLiteral,
    FunctionExpression,
    Identifier,
    IntegerLiteral,
    Operation,
    Program,
    Sets,
    SetSingle,
    Statement,
    UnaryExpression
} from '../types/astNodes.js'
import {LangCompileError} from "../types/languageError";

export class Parser {
    tokens: Token[] = []
    lastConsumedToken: Token | undefined

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    consume(): Token {
        this.lastConsumedToken = this.tokens.shift() as Token
        return this.lastConsumedToken
    }

    peek(where = 0): Token {
        return this.tokens[where] as Token
    }

    typeMatches(where: number, ...tokenTypes: TokenType[]): boolean {
        let currentToken = this.peek(where)
        if (!currentToken || !tokenTypes.includes(currentToken.type)) {
            return false
        }
        return true
    }

    typeMatchesStatement(where: number, ...tokenTypes: TokenType[]) {
        this.skipNewLines()
        return this.typeMatches(where, ...tokenTypes)
    }

    expect(err: string, ...tokenTypes: TokenType[]): Token {
        const currentToken = this.consume()
        if (!currentToken || !tokenTypes.includes(currentToken.type)) {
            console.log(this.tokens)
            throw new LangCompileError(err, currentToken)
        }

        return currentToken
    }

    expectNewStatement(err: string) {
        this.skipNewLines()
        if (this.lastConsumedToken != undefined && this.lastConsumedToken.type != TokenType.NewLine) {
            throw new LangCompileError(err, this.peek())
        }
    }

    skipNewLines() {
        while (this.peek().type === TokenType.NewLine) {
            this.consume()
        }
    }

    parse(): Program {
        const program: Program = {
            kind: "Program",
            body: []
        }

        this.expect("Программа должна начинаться со слова 'Программа'", TokenType.Start)
        program.body.push(this.parseSets())
        do {
            this.expectNewStatement("Перед началом нового оператора должна идти новая строка")
            program.body.push(this.parseOperator())
        } while (this.typeMatchesStatement(1, TokenType.Equals))
        this.expectNewStatement("Конец программы должен быть на новой строке")
        this.expect("Программа должна заканчиваться словом 'Конец'", TokenType.End)
        this.expect("После слова 'Конец' не может быть символов", TokenType.EOF)

        return program
    }


    parseSets(): Sets {
        const sets: Sets = {
            kind: "Sets",
            body: []
        }
        do {
            this.expectNewStatement("Перед началом нового множества должна идти новая строка")
            sets.body.push(this.parseSet())
        } while (this.typeMatchesStatement(0, TokenType.Execute, TokenType.Save))

        return sets
    }

    parseSet(): SetSingle {
        const action = this.expect("Множество должно начинаться со слов 'Выполнить' или 'Сохранить'", TokenType.Execute, TokenType.Save)
        this.expect("После 'Выполнить' или 'Сохранить' должно стоять ':' (двоеточие)", TokenType.Colon)
        const numbers: FloatLiteral[] = []
        do {
            numbers.push(this.parseFloat())
        } while (this.typeMatches(1, TokenType.Dot))
        const additional = this.expect("Множество должно заканчиваться на 'Первое' или 'Второе'", TokenType.First, TokenType.Second)
        if (!additional.isSpaceBefore) throw new LangCompileError("Перед 'Первое' или 'Второе' должен быть разделитель", additional)

        return {
            kind: "SetSingle",
            action: action,
            body: numbers,
            additional: additional
        }
    }

    parseFloat(): FloatLiteral {
        let numAsString: string = ""
        numAsString += this.expect("Вещественное число должно начинаться с целого числа", TokenType.Integer).value
        numAsString += this.expect("Вещественное число долно иметь '.' (точку) как разделитель", TokenType.Dot).value
        if (this.lastConsumedToken?.isSpaceBefore) {
            throw new LangCompileError("Между точкой и целым не может быть пробела в вещественных числах", this.lastConsumedToken!)
        }
        numAsString += this.expect("Вещественное число долно заканчиваться целым числом", TokenType.Integer).value
        if (this.lastConsumedToken?.isSpaceBefore) {
            throw new LangCompileError("Между точкой и целым не может быть пробела в вещественных числах", this.lastConsumedToken!)
        }
        return {
            kind: "FloatLiteral",
            value: +numAsString
        }
    }

    parseOperator(): Operation {
        const identifier = this.expect("Операция должна начинаться с объявления переменной", TokenType.Identifier)
        this.expect("После объявление переменной должен стоять знак '='", TokenType.Equals)
        const rhs = this.parseAddition()
        return {
            kind: "Operation",
            identifier: identifier,
            rhs: rhs
        }
    }

    parseAddition(): Expression {
        let operation: Token | null = null
        if (this.peek().value === "-") {
            operation = this.consume()
        }
        let left = this.parseMultiplication()
        if (operation) {
            left = {kind: "UnaryExpression", inner: left, operation: operation} as UnaryExpression
        }
        while (this.typeMatches(0, TokenType.AdditiveOperators)) {
            const operator = this.consume()
            const right = this.parseMultiplication()
            left = {
                kind: "BinaryExpression",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpression
        }
        return left
    }

    parseMultiplication(): Expression {
        let left = this.parseLogic()
        while (this.typeMatches(0, TokenType.MultiplicativeOperators)) {
            const operator = this.consume()
            const right = this.parseLogic()
            left = {
                kind: "BinaryExpression",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpression
        }
        return left
    }

    parseLogic(): Expression {
        let left = this.parseReverseLogic()

        while (this.typeMatches(0, TokenType.LogicOperators)) {
            const operator = this.consume()
            const right = this.parseReverseLogic()
            left = {
                kind: "BinaryExpression",
                lhs: left,
                rhs: right,
                operator
            } as BinaryExpression
        }
        return left
    }

    parseReverseLogic(): Expression {
        let operation: Token | null = null
        if (this.peek().value === "!" || this.peek().value === "НЕ") {
            operation = this.consume()
        }
        let inner = this.parseFunctions()

        if (operation) {
            inner = {
                kind: "UnaryExpression",
                inner: inner,
                operation: operation
            } as UnaryExpression
        }

        return inner
    }

    parseFunctions(): Expression {
        const functions: Token[] = []
        while (this.typeMatches(0,TokenType.Function)) {
            functions.push(this.consume())
        }

        let inner = this.parsePrimitives()
        while (functions.length > 0) {
            inner = {
                kind: "FunctionExpression",
                inner: inner,
                func: functions.pop()
            } as FunctionExpression
        }

        return inner
    }

    parsePrimitives(): Expression {
        switch (this.peek().type) {
            case TokenType.AdditiveOperators:
            case TokenType.MultiplicativeOperators:
            case TokenType.LogicOperators:
                throw new LangCompileError("Две операции не могут стоять подряд", this.peek())
        }

        const currentToken = this.expect("В выражении должны быть Переменная или Целое число", TokenType.Integer, TokenType.Identifier)

        switch (currentToken.type) {
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: currentToken} as Identifier
            case TokenType.Integer:
                return {kind: "IntegerLiteral", value: +currentToken.value} as IntegerLiteral
        }
        throw new LangCompileError("В выражении должны быть только Переменная или Целое число", currentToken)
    }
}