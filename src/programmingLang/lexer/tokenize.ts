import {TokenType, type Token} from "../types/tokens";
import {LanguageSpecifics} from "./languageSpecifics";
import {SourceCode} from "./sourceCode";
import {LangSyntaxError} from "../types/languageError";

export function tokenize(sourceCode: SourceCode): Token[] {
    const tokens: Token[] = []

    let isSpaceBefore = false
    let startOfStatement = 0
    while (!sourceCode.isLast()) {
        if (sourceCode.isNextSkipabble()) {
            sourceCode.consume()
            isSpaceBefore = true // TO FORCE SPACES SOMETIMES
            continue
        }
        if (sourceCode.peek() === "\n") {
            tokens.push({
                type: TokenType.NewLine,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: startOfStatement,
                to: sourceCode.currentSymbol
            })
            startOfStatement = sourceCode.currentSymbol // TO FORCE NEWLINES
        }
        else if (sourceCode.peek() === "=") {
            tokens.push({
                type: TokenType.Equals,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            })
        } else if (sourceCode.peek() === ":") {
            tokens.push({
                type: TokenType.Colon,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            })
        } else if (sourceCode.peek() === ".") {
            tokens.push({
                type: TokenType.Dot,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            })
        } else if (sourceCode.isNextAdditiveOperator()) {
            tokens.push({
                type: TokenType.AdditiveOperators,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            })
        } else if (sourceCode.isNextMultiplicativeOperator()) {
            tokens.push({
                type: TokenType.MultiplicativeOperators,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            })
        } else if (sourceCode.isNextLogicOperator()) {
            tokens.push({
                type: TokenType.LogicOperators,
                value: sourceCode.consume(),
                isSpaceBefore,
                from: sourceCode.currentSymbol,
                to: sourceCode.currentSymbol
            })
        } else {
            if (sourceCode.isNextLogic()) {
                let value = ""
                while (sourceCode.isNextLogic()) {
                    value += sourceCode.consume()
                }

                const reserved = LanguageSpecifics.reservedKeyword(value)
                if (reserved) {
                    tokens.push({
                        type: reserved,
                        value,
                        isSpaceBefore,
                        from: sourceCode.currentSymbol - value.length,
                        to: sourceCode.currentSymbol
                    })
                }
                throw new LangSyntaxError("Неизветстный логический символ, допустимые символы: '&&' или '||'", sourceCode.currentSymbol - value.length + 1, sourceCode.currentSymbol) // TODO: REDO
            } else if (sourceCode.isNextNumeric()) {
                let value = ""
                while (sourceCode.isNextNumeric()) {
                    value += sourceCode.consume()
                }

                // if (value[0] === "0" && value.length > 1)
                //     throw Error("Число не может иметь ведущих нулей")

                tokens.push({type: TokenType.Integer, value, isSpaceBefore, from: sourceCode.currentSymbol - value.length + 1, to: sourceCode.currentSymbol})
            } else if (sourceCode.isNextAlphanumeric()) {
                let value = ""
                while (sourceCode.isNextAlphanumeric()) {
                    value += sourceCode.consume()
                }

                const reserved = LanguageSpecifics.reservedKeyword(value)
                if (reserved) {
                    tokens.push({type: reserved, value, isSpaceBefore, from: sourceCode.currentSymbol - value.length + 1, to: sourceCode.currentSymbol})
                } else if (LanguageSpecifics.isIdentifier(value)) {
                    tokens.push({type: TokenType.Identifier, value, isSpaceBefore, from: sourceCode.currentSymbol - value.length + 1, to: sourceCode.currentSymbol})
                } else {
                    throw new LangSyntaxError(`Неизвестная последовательность символов '${value}'`, sourceCode.currentSymbol - value.length + 1, sourceCode.currentSymbol) // TODO: REDO
                }
            } else {
                throw new LangSyntaxError(`Неизвестный символ ${sourceCode.consume().charCodeAt(0)}`, sourceCode.currentSymbol, sourceCode.currentSymbol) // TODO: REDO
            }
        }
        isSpaceBefore = false
    }
    tokens.push({type: TokenType.EOF, value: "", from: sourceCode.currentSymbol, to: sourceCode.currentSymbol})

    return tokens
}

// import * as fs from "fs";

// const resultTokens = tokenize(new SourceCode(fs.readFileSync("./test.lang").toString()))
//
// for (const resultToken of resultTokens) {
//     console.log(`${TokenType[resultToken.type]} - ${resultToken.value}`)
// }

//TODO: FIX <NUM_LITERAL>*no_space*<RESERVED|IDENTIFIER>