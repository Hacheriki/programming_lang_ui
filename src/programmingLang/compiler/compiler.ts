import {
    type BinaryExpression, type FunctionExpression,
    type Identifier,
    type IntegerLiteral,
    type Operation,
    type Program,
    type Statement,
    type UnaryExpression
} from "../types/astNodes";
import Scope from "./scope";
import {type BooleanValue, makeBoolean, makeNull, makeNumber, type NumberValue, type RuntimeValue} from "../types/values";
import {LangCompileError} from "@/programmingLang/types/languageError";

export function evaluate(astNode: Statement, scope: Scope = new Scope()): RuntimeValue {
    switch (astNode.kind) {
        case "Program":
            return evaluateProgram(astNode as Program, scope)
        case "Operation":
            return evaluateOperation(astNode as Operation, scope)
        case "Identifier":
            return evaluateIdentifier(astNode as Identifier, scope)
        case "IntegerLiteral":
            return evaluateInteger(astNode as IntegerLiteral)
        case "UnaryExpression":
            return evaluateUnary(astNode as UnaryExpression, scope)
        case "BinaryExpression":
            return evaluateBinary(astNode as BinaryExpression, scope)
        case "FunctionExpression":
            return evaluateFunction(astNode as FunctionExpression, scope)
        case "Sets":
            return makeNull()
        case "SetSingle":
            return makeNull()
        case "FloatLiteral":
            return  makeNull()
        default:
            throw Error("Неизвестное выражение")
    }
}
function evaluateProgram(program: Program, scope: Scope): RuntimeValue {
    let lastEvaluated: RuntimeValue = makeNull()
    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, scope)
    }
    return lastEvaluated
}

function evaluateOperation(operation: Operation, scope: Scope): RuntimeValue {
    const value = evaluate(operation.rhs, scope)
    return scope.declareVariable(operation.identifier, value)
}

function evaluateIdentifier(identifier: Identifier, scope: Scope): RuntimeValue {
    return scope.lookupVariable(identifier.symbol)
}

function evaluateInteger(integer: IntegerLiteral): RuntimeValue {
    return makeNumber(integer.value)
}

//TODO: THINK ABOUT BOOLEAN + NUMERIC || BOOLEAN + BOOLEAN || NUMERIC + NUMERIC
function evaluateUnary(unary: UnaryExpression, scope: Scope): RuntimeValue {
    const inner = evaluate(unary.inner, scope)
    switch (unary.operation.value) {
        case "-":
            return makeNumber(-toNumberValue(inner).value)
        case "!":
        case "НЕ":
            return makeBoolean(!toBooleanValue(inner).value)
    }
    throw Error("Неизвестная унарная операция")
}

function evaluateBinary(binary: BinaryExpression, scope: Scope): RuntimeValue {
    const lhs = evaluate(binary.lhs, scope)
    const rhs = evaluate(binary.rhs, scope)

    switch (binary.operator.value) {
        case "&&" :
        case "И":
        case "||":
        case "ИЛИ":
            return evaluateBinaryLogic(toBooleanValue(lhs), toBooleanValue(rhs), binary.operator.value)
        case "+":
        case "-":
        case "*":
        case "/":
            if (toNumberValue(rhs).value === 0)
                throw new LangCompileError("Невозможно деление на 0", binary.operator)
            return evaluateBinaryNumbers(toNumberValue(lhs), toNumberValue(rhs), binary.operator.value)
        default:
            throw Error("Неизвестная бинарная операция")
    }
}

function evaluateBinaryLogic(lhs: BooleanValue, rhs: BooleanValue, operation: string) {
    switch (operation) {
        case "&&" :
        case "И":
            return toNumberValue(makeBoolean(lhs.value && rhs.value))
        case "||":
        case "ИЛИ":
            return toNumberValue(makeBoolean(lhs.value || rhs.value))
        default:
            throw Error("Неизвестная логическая операция")
    }
}

function evaluateBinaryNumbers(lhs: NumberValue, rhs: NumberValue, operation: string) {
    switch (operation) {
        case "+":
            return makeNumber(lhs.value + rhs.value)
        case "-":
            return makeNumber(lhs.value - rhs.value)
        case "*":
            return makeNumber(lhs.value * rhs.value)
        case "/":
            return makeNumber(lhs.value / rhs.value)
        default:
            throw Error("Неизвестная бинарная операция над числами")
    }
}

function toNumberValue(value: RuntimeValue): NumberValue {
    switch (value.type) {
        case "number":
            return makeNumber((value as NumberValue).value)
        case "boolean":
            return makeNumber((value as BooleanValue).value ? 1 : 0)
        default:
            throw Error("Невозможно привести тип к целочисленному")
    }
}

function toBooleanValue(value: RuntimeValue): BooleanValue {
    switch (value.type) {
        case "number":
            return makeBoolean((value as NumberValue).value !== 0)
        case "boolean":
            return makeBoolean((value as BooleanValue).value)
        default:
            throw Error("Невозможно привести тип к целочисленному")
    }
}

// "Синус": TokenType.Function,
// "Косинус": TokenType.Function,
// "Тангенс": TokenType.Function,
// "Котангенс": TokenType.Function,

// TODO: FLOAT???
function evaluateFunction(functionExpression: FunctionExpression, scope: Scope): RuntimeValue {
    const inner = toNumberValue(evaluate(functionExpression.inner, scope))

    switch (functionExpression.func.value) {
        case "Синус":
            return makeNumber(Math.sin(inner.value))
        case "Косинус":
            return makeNumber(Math.cos(inner.value))
        case "Тангенс":
            return makeNumber(Math.tan(inner.value))
        case "Котангенс":
            return makeNumber(1 / Math.tan(inner.value))
        default:
            throw Error("Неизвестная функция")
    }
}