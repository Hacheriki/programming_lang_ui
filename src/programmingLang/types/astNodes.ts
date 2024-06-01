import {type Token} from './tokens'

export type NodeType =
    "Program"
    | "BinaryExpression"
    | "Identifier"
    | "IntegerLiteral"
    | "Operation"
    | "UnaryExpression"
    | "Chains"
    | "ChainSingle"
    | "Mark"
    | "Word"

export interface Statement {
    kind: NodeType
}

export interface Program extends Statement {
    kind: "Program"
    body: Statement[]
}

export interface Chains extends Statement {
    kind: "Chains"
    body: ChainSingle[]
}

export interface ChainSingle extends Statement {
    kind: "ChainSingle"
    body: Word[]
}

export interface Word extends Statement {
    kind: "Word",
    identifier: Token,
    rhs: Expression
}

export interface Expression extends Statement {
}

export interface BinaryExpression extends Expression {
    kind: "BinaryExpression"
    lhs: Expression;
    rhs: Expression;
    operator: Token
}

export interface Identifier extends Expression {
    kind: "Identifier"
    symbol: Token
}

export interface IntegerLiteral extends Expression {
    kind: "IntegerLiteral"
    value: number
}

export interface UnaryExpression extends Expression {
    kind: "UnaryExpression",
    operation: Token,
    inner: Expression
}