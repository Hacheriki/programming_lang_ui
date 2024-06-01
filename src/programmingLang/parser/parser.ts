import {type Token, TokenType} from '../types/tokens'
import type {
    BinaryExpression,
    Chains,
    ChainSingle,
    Expression,
    Identifier,
    IntegerLiteral,
    Program,
    UnaryExpression,
    Word
} from '../types/astNodes.js'
import {LangCompileError} from "../types/languageError";

export class Parser {
    tokens: Token[] = []
    lastConsumedToken: Token | undefined
    bracketCounter: number = 0
    paranCounter: number = 0

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
        const previousToken = this.lastConsumedToken
        const currentToken = this.consume()
        if (!currentToken || !tokenTypes.includes(currentToken.type)) {
            if (currentToken.type === TokenType.NewLine) {
                throw new LangCompileError(err, previousToken!)
            }
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
        program.body.push(this.parseChains())
        this.skipNewLines()
        console.log(this.peek().type)
        if (this.peek().type !== TokenType.End) {
            throw new LangCompileError("Программа должна заканчиваться словом 'Конец'", this.peek())
        }
        this.expectNewStatement("Конец программы должен быть на новой строке")
        this.expect("Программа должна заканчиваться словом 'Конец'", TokenType.End)
        this.expect("После слова 'Конец' не может быть символов", TokenType.EOF)

        return program
    }

    parseChains(): Chains {
        const chains: Chains = {
            kind: "Chains",
            body: []
        }
        this.skipNewLines()
        if (this.peek().type != TokenType.Enter) {
            throw new LangCompileError("В программе должно быть хотя бы одно звено", this.peek())
        }
        do {
            // this.expectNewStatement("Перед началом нового множества должна идти новая строка")
            chains.body.push(this.parseChain())
            if (this.peek().type != TokenType.End) {
                if (this.peek().type === TokenType.Integer || this.peek().type === TokenType.Identifier) {
                    throw new LangCompileError(`Перед '${this.peek().value}' должна быть операция`, this.peek())
                }
                if (this.peek().type === TokenType.CloseBracket || this.peek().type === TokenType.CloseParan) {
                    throw new LangCompileError("Перед закрывающей скобкой должна быть открывающая", this.peek())
                }
                if (this.peek().type === TokenType.OpenBracket && this.lastConsumedToken?.type === TokenType.CloseBracket ||
                    this.peek().type === TokenType.OpenParan && this.lastConsumedToken?.type === TokenType.CloseParan ||
                    this.peek().type === TokenType.OpenBracket && this.lastConsumedToken?.type === TokenType.CloseParan ||
                    this.peek().type === TokenType.OpenParan && this.lastConsumedToken?.type === TokenType.CloseBracket
                ) {
                    throw new LangCompileError("Между скобками должна быть операция", this.peek())
                }
                if (this.peek().type === TokenType.OpenBracket || this.peek().type === TokenType.OpenParan) {
                    throw new LangCompileError("После открывающей скобки должно быть выражение", this.peek())
                }
                if (this.peek().type === TokenType.EOF) {
                    throw new LangCompileError("Программа должна заканчиваться словом 'Конец'", this.peek())
                }
                this.expect("Между звеньями должен быть разделитель ';'", TokenType.Semicolon)
            }
        } while (!this.typeMatchesStatement(0, TokenType.End, TokenType.EOF))

        return chains
    }

    parseChain(): ChainSingle {
        this.expect("Звено должно начинаться со слова 'Ввод'", TokenType.Enter)
        const chain: ChainSingle = {
            kind: "ChainSingle",
            body: []
        }

        do {
            this.skipNewLines()
            chain.body.push(this.parseWord())
        } while (this.typeMatchesStatement(1, TokenType.Colon))

        return chain
    }

    parseWord(): Word {
        this.expect("Слово должно начинаться с метки", TokenType.Integer)
        this.expect("После метки должно идти ':'", TokenType.Colon)

        const identifier = this.expect("После объявления метки должно идти объявление переменной", TokenType.Identifier)
        this.expect("После объявление переменной должен стоять знак '='", TokenType.Equals)
        const rhs = this.parseAddition()
        // if (!this.typeMatches(0, TokenType.NewLine)) {
        //     console.log(this.tokens, this.lastConsumedToken)
        //     throw new LangCompileError("Выражения должны быть объединены операторами сложения ('+','-')\nили логическими операторами ('&&','||','1')", this.peek())
        // }
        return {
            kind: "Word",
            identifier: identifier,
            rhs: rhs
        }
    }

    parseAddition(): Expression {
        let left = this.parseReverseAddition()
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

    parseReverseAddition(): Expression {
        let operation: Token | null = null
        if (this.peek().value === "-") {
            operation = this.consume()
        }
        let inner = this.parseMultiplication()

        if (operation) {
            inner = {
                kind: "UnaryExpression",
                inner: inner,
                operation: operation
            } as UnaryExpression
        }

        return inner
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
        if (this.peek().value === "!") {
            operation = this.consume()
        }
        let inner = this.parsePrimitives()

        if (operation) {
            inner = {
                kind: "UnaryExpression",
                inner: inner,
                operation: operation
            } as UnaryExpression
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

        const currentToken = this.expect(`После '${this.lastConsumedToken?.value}' должны быть Переменная, Целое число, Открывающие Квадратные или Круглые скобки`, TokenType.Integer, TokenType.Identifier, TokenType.OpenParan, TokenType.OpenBracket)

        if (currentToken.type === TokenType.CloseParan && this.paranCounter === 0) {
            throw new LangCompileError("Перед закрывающей скобкой должна идти открывающая", currentToken)
        }

        if (currentToken.type === TokenType.CloseBracket && this.bracketCounter === 0) {
            throw new LangCompileError("Перед закрывающей скобкой должна идти открывающая", currentToken)
        }

        switch (currentToken.type) {
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: currentToken} as Identifier
            case TokenType.Integer:
                return {kind: "IntegerLiteral", value: +currentToken.value} as IntegerLiteral
            case TokenType.OpenParan: {
                this.paranCounter++
                const value = this.parseAddition()
                this.expect("Пропущена закрывающая скобка", TokenType.CloseParan)
                this.paranCounter--
                return value
            }
            case TokenType.OpenBracket: {
                this.bracketCounter++
                if (this.bracketCounter > 2) {
                    throw new LangCompileError("Превышено количество вложенности квадратных скобок", currentToken)
                }
                const value = this.parseAddition()
                this.expect("Пропущена закрывающая скобка", TokenType.CloseBracket)
                this.bracketCounter--
                return value
            }
        }
        throw new LangCompileError("В выражении должны быть только Переменная, Целое число, Квадратные или Круглые скобки", currentToken)
    }
}