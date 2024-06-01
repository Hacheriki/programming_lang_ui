import {TokenType} from "../types/tokens";

export class LanguageSpecifics {
    static firstLetter = "А"
    static lastLetter = "Я"

    static firstNumber = "0"
    static lastNumber = "7"

    static skippables = [" ", "/t", String.fromCharCode(13)]

    static booleans = ["&&", "||", "!"]
    static additives = ["+", "-"]
    static multiplicatives = ["*", "/"]

    static KEYWORDS: Record<string, TokenType> = {
        "Программа": TokenType.Start,
        "Конец": TokenType.End,
        "Ввод": TokenType.Enter,
        "&&": TokenType.LogicOperators,
        "||": TokenType.LogicOperators
    }

    static isAlphabetic(symbol: string): boolean {
        const upperSymbol = symbol.toUpperCase()

        return this.firstLetter <= upperSymbol && upperSymbol <= this.lastLetter;
    }

    static isNumeric(symbol: string): boolean {
        return this.firstNumber <= symbol && symbol <= this.lastNumber;
    }

    static isAlphanumeric(symbol: string): boolean {
        return this.isNumeric(symbol) || this.isAlphabetic(symbol)
    }

    static isLogic(symbol: string): boolean {
        return symbol === "|" || symbol === "&"
    }

    static isSkipabble(symbol: string): boolean {
        return this.skippables.includes(symbol)
    }

    static isLogicOperator(str: string): boolean {
        return this.booleans.includes(str)
    }

    static isAdditiveOperator(str: string): boolean {
        return this.additives.includes(str)
    }

    static isMultiplicativeOperator(str: string): boolean {
        return this.multiplicatives.includes(str)
    }

    static reservedKeyword(str: string): TokenType | undefined {
        return this.KEYWORDS[str]
    }

    static isIdentifier(str: string): boolean {
        if (str.length != 4)
            return false

        if (!this.isAlphabetic(str[0])) {
            return false
        }

        if (!this.isNumeric(str[1])) {
            return false
        }

        if (!this.isNumeric(str[2])) {
            return false
        }

        if (!this.isNumeric(str[3])) {
            return false
        }

        return true
    }
}