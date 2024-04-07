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
    Equals,
    AdditiveOperators, // [+,-]
    MultiplicativeOperators, // [*,/]
    Dot,
    //// MULTICHAR TOKENS
    // RESERVED
    Start,
    End,
    Execute,
    Save,
    First,
    Second,
    Function,
    LogicOperators, // WHAT IS LOGIC? [&&, ||, И, ИЛИ] SOLVE FOR EQUALS
    // FREE
    Identifier,
    Integer,
    EOF,
}