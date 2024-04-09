import {LanguageSpecifics} from "./languageSpecifics";

export class SourceCode {
    private readonly sourceCode: string[]
    currentSymbol: number = 0

    constructor(sourceCode: string) {
        this.sourceCode = sourceCode.split("").reverse()
    }

    peek(): string {
        return this.sourceCode[this.sourceCode.length-1] || ""
    }

    consume(): string {
        this.currentSymbol++
        return this.sourceCode.pop() || ""
    }

    isLast(): boolean {
        return this.sourceCode.length == 0
    }

    isNextAlphabetic(): boolean {
        return LanguageSpecifics.isAlphabetic(this.peek())
    }

    isNextNumeric(): boolean {
        return LanguageSpecifics.isNumeric(this.peek())
    }

    isNextAlphanumeric(): boolean {
        return LanguageSpecifics.isAlphanumeric(this.peek())
    }

    isNextLogic(): boolean {
        return LanguageSpecifics.isLogic(this.peek())
    }

    isNextSkipabble(): boolean {
        return LanguageSpecifics.isSkipabble(this.peek())
    }

    isNextLogicOperator(): boolean {
        return LanguageSpecifics.isLogicOperator(this.peek())
    }

    isNextMultiplicativeOperator(): boolean {
        return LanguageSpecifics.isMultiplicativeOperator(this.peek())
    }

    isNextAdditiveOperator(): boolean {
        return LanguageSpecifics.isAdditiveOperator(this.peek())
    }
}