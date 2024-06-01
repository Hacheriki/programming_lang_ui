export interface Token {
    value: string,
    type: TokenType,
    from: number,
    to: number,
    isSpaceBefore?: boolean
}

export enum TokenType {
    //// SINGLE CHAR TOKENS
    Colon,
    Semicolon,
    Equals,
    AdditiveOperators, // [+,-]
    MultiplicativeOperators, // [*,/]
    OpenParan,
    CloseParan,
    OpenBracket,
    CloseBracket,
    //// MULTICHAR TOKENS
    // RESERVED
    Start,
    End,
    Enter,
    LogicOperators, // WHAT IS LOGIC? [&&, ||, И, ИЛИ] SOLVE FOR EQUALS
    // FREE
    Identifier,
    Integer,
    EOF,
    NewLine
}