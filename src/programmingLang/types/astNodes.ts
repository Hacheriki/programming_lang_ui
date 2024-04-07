import {type Token} from './tokens'

export type NodeType =
    "Program"
    | "BinaryExpression"
    | "Identifier"
    | "IntegerLiteral"
    | "FloatLiteral"
    | "Sets"
    | "SetSingle"
    | "Operation"
    | "FunctionExpression"
    | "UnaryExpression"

export interface Statement {
    kind: NodeType
}

export interface Program extends Statement {
    kind: "Program"
    body: Statement[]
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

export interface FloatLiteral extends Expression {
    kind: "FloatLiteral"
    value: number
}

export interface Sets extends Statement {
    kind: "Sets"
    body: SetSingle[]
}

export interface SetSingle extends Statement {
    kind: "SetSingle"
    action: Token
    body: FloatLiteral[]
    additional: Token
}

export interface Operation extends Statement {
    kind: "Operation",
    identifier: Token,
    rhs: Expression
}

export interface FunctionExpression extends Expression {
    kind: "FunctionExpression",
    func: Token,
    inner: Expression
}

export interface UnaryExpression extends Expression {
    kind: "UnaryExpression",
    operation: Token,
    inner: Expression
}