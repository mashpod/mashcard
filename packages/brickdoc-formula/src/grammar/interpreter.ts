import { CstElement, CstNode, IToken, tokenMatcher } from 'chevrotain'
import {
  AnyTypeResult,
  NullResult,
  SpreadsheetResult,
  NumberResult,
  BooleanResult,
  PredicateResult,
  ReferenceResult,
  PredicateOperator,
  ErrorResult,
  Argument,
  FunctionContext,
  FormulaType,
  ExpressionType,
  BlockResult,
  StringResult
} from '../types'
import { ColumnClass, Row, SpreadsheetType } from '../controls'
import { extractSubType, parseString, runtimeCheckType } from './util'
import { buildFunctionKey } from '../functions'
import { BaseCstVisitor } from './parser'
import {
  Div,
  Equal2,
  Equal,
  GreaterThanEqual,
  GreaterThan,
  LessThanEqual,
  LessThan,
  Minus,
  Multi,
  NotEqual2,
  NotEqual,
  Plus,
  And,
  Or,
  Caret
} from './lexer'
import { BlockClass } from '../controls/block'

interface ExpressionArgument {
  readonly type: ExpressionType
  readonly firstArgumentType?: FormulaType
  readonly finalTypes: ExpressionType[]
  lazy?: boolean
  chainArgs?: any
}

export class FormulaInterpreter extends BaseCstVisitor {
  ctx: FunctionContext
  lazy: boolean = false

  constructor({ ctx }: { ctx: FunctionContext }) {
    super()
    this.ctx = ctx
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor()
  }

  startExpression(ctx: { expression: CstNode | CstNode[] }, args: ExpressionArgument): AnyTypeResult {
    return this.visit(ctx.expression, args)
  }

  expression(ctx: { lhs: CstNode | CstNode[]; rhs: any }, args: ExpressionArgument): AnyTypeResult {
    let result: AnyTypeResult = this.visit(ctx.lhs, args)

    if (!ctx.rhs) {
      return result
    }

    ctx.rhs.forEach((rhs: CstNode | CstNode[]) => {
      const newResult = this.visit(rhs, args)

      if (newResult.type === 'Function' && result.type === 'Function') {
        result = { type: 'Function', result: [...result.result, ...newResult.result] }
      } else {
        result = newResult
      }
    })

    return result
  }

  combineExpression(
    ctx: {
      lhs: CstNode | CstNode[]
      rhs: any[]
      CombineOperator: { [x: string]: any }
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'boolean'
    const typeError = runtimeCheckType(args.type, parentType, 'combineExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }

    let result: AnyTypeResult = this.visit(ctx.lhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      if (result.type === 'Error') {
        return
      }

      const rhsValue = this.visit(rhsOperand, newArgs)
      const operator = ctx.CombineOperator[idx]

      if (rhsValue.type === 'Error') {
        result = rhsValue
        return
      }

      const lhsResult: boolean = result.result as boolean
      const rhsResult: boolean = rhsValue.result

      if (tokenMatcher(operator, And)) {
        result = { result: lhsResult && rhsResult, type: 'boolean' }
      } else if (tokenMatcher(operator, Or)) {
        result = { result: lhsResult || rhsResult, type: 'boolean' }
      } else {
        throw new Error(`Unexpected operator ${operator.image}`)
      }
    })

    return result
  }

  notExpression(ctx: { rhs: CstNode | CstNode[]; lhs: any[] }, args: ExpressionArgument): AnyTypeResult {
    if (!ctx.lhs) {
      return this.visit(ctx.rhs, args)
    }

    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'any'
    const typeError = runtimeCheckType(args.type, parentType, 'notExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }
    let result: AnyTypeResult = this.visit(ctx.rhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.lhs.forEach(() => {
      result = { result: !result.result, type: 'boolean' }
    })

    return result
  }

  equalCompareExpression(
    ctx: {
      lhs: CstNode | CstNode[]
      rhs: any[]
      EqualCompareOperator: { [x: string]: any }
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'any'
    const typeError = runtimeCheckType(args.type, parentType, 'equalCompareExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }
    let result: AnyTypeResult = this.visit(ctx.lhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      if (result.type === 'Error') {
        return
      }
      const rhsValue = this.visit(rhsOperand, newArgs)
      const operator = ctx.EqualCompareOperator[idx]

      if (rhsValue.type === 'Error') {
        result = rhsValue
        return
      }

      if (tokenMatcher(operator, Equal) || tokenMatcher(operator, Equal2)) {
        result = { result: result.result === rhsValue.result, type: 'boolean' }
      } else if (tokenMatcher(operator, NotEqual) || tokenMatcher(operator, NotEqual2)) {
        result = { result: result.result !== rhsValue.result, type: 'boolean' }
      } else {
        throw new Error(`Unexpected operator ${operator.image}`)
      }
    })

    return result
  }

  compareExpression(
    ctx: {
      lhs: CstNode | CstNode[]
      rhs: any[]
      CompareOperator: { [x: string]: any }
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'boolean'
    const childrenType: FormulaType = 'number'
    const typeError = runtimeCheckType(args.type, parentType, 'compareExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }
    let result: AnyTypeResult = this.visit(ctx.lhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      if (result.type === 'Error') {
        return
      }
      // there will be one operator for each rhs operand
      const rhsValue = this.visit(rhsOperand, newArgs)

      if (rhsValue.type === 'Error') {
        result = rhsValue
        return
      }

      const operator = ctx.CompareOperator[idx]

      const lhsResult = result.result as number

      if (tokenMatcher(operator, GreaterThan)) {
        result = { result: lhsResult > rhsValue.result, type: 'boolean' }
      } else if (tokenMatcher(operator, LessThan)) {
        result = { result: lhsResult < rhsValue.result, type: 'boolean' }
      } else if (tokenMatcher(operator, GreaterThanEqual)) {
        result = { result: lhsResult >= rhsValue.result, type: 'boolean' }
      } else if (tokenMatcher(operator, LessThanEqual)) {
        result = { result: lhsResult <= rhsValue.result, type: 'boolean' }
      } else {
        throw new Error(`Unexpected operator ${operator.image}`)
      }
    })

    return result
  }

  inExpression(
    ctx: {
      lhs: CstNode | CstNode[]
      rhs: CstNode | CstNode[]
      InOperator: Array<{ tokenType: { name: any } }>
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'boolean'
    const typeError = runtimeCheckType(args.type, parentType, 'inExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const result = this.visit(ctx.lhs, { ...args, type: ['number', 'boolean', 'null', 'string'] })

    if (result.type === 'Error') {
      return result
    }

    const operator = ctx.InOperator[0].tokenType.name

    const result2 = this.visit(ctx.rhs, { ...args, type: ['Spreadsheet', 'Column', 'Array', 'string'] })

    if (result2.type === 'Error') {
      return result2
    }

    if (result2.type === 'Spreadsheet') {
      const match = String(result.result)
      const spreadsheet: SpreadsheetType = result2.result

      const columns = spreadsheet.listColumns()

      const firstColumn = columns[0]
      if (!firstColumn) {
        return { type: 'Error', result: 'Spreadsheet is empty', errorKind: 'runtime' }
      }

      const row = spreadsheet.listRows().find((row: Row) => {
        const firstCellValue = spreadsheet.findCellValue({ rowId: row.rowId, columnId: firstColumn.columnId })!
        if (operator === 'ExactIn') {
          return firstCellValue === match
        } else {
          return firstCellValue.toUpperCase() === match.toUpperCase()
        }
      })

      return { type: 'boolean', result: !!row }
    }

    if (result2.type === 'Column') {
      const match = String(result.result)
      const column = result2.result
      const spreadsheet = this.ctx.formulaContext.findSpreadsheet(column.namespaceId)
      if (!spreadsheet) {
        return { type: 'Error', result: 'Spreadsheet not found', errorKind: 'runtime' }
      }

      const row = spreadsheet.listRows().find((row: Row) => {
        const cellValue = spreadsheet.findCellValue({ rowId: row.rowId, columnId: column.columnId })!
        if (operator === 'ExactIn') {
          return cellValue === match
        } else {
          return cellValue.toUpperCase() === match.toUpperCase()
        }
      })

      return { type: 'boolean', result: !!row }
    }

    if (operator === 'ExactIn' || result.type !== 'string') {
      const checkResult = result2.type === 'Array' ? result2.result.map((e: AnyTypeResult) => e.result) : result2.result
      return { result: checkResult.includes(result.result), type: 'boolean' }
    }

    if (result2.type === 'string') {
      const finalResult = result2.result.toUpperCase().includes(result.result.toUpperCase())
      return { result: finalResult, type: 'boolean' }
    } else {
      const match = result.result.toUpperCase()
      const finalresult = result2.result
        .filter((e: AnyTypeResult) => e.type === 'string')
        .map((e: StringResult) => e.result.toUpperCase())

      return { result: finalresult.includes(match), type: 'boolean' }
    }
  }

  concatExpression(ctx: { lhs: CstNode | CstNode[]; rhs: any[] }, args: ExpressionArgument): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'string'
    const childrenType: FormulaType = 'string'
    const typeError = runtimeCheckType(args.type, parentType, 'concatExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }
    let result: AnyTypeResult = this.visit(ctx.lhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[]) => {
      if (result.type === 'Error') {
        return
      }

      const rhsValue = this.visit(rhsOperand, newArgs)

      if (rhsValue.type === 'Error') {
        result = rhsValue
        return
      }

      result = { result: (result as StringResult).result.concat(rhsValue.result), type: 'string' }
    })

    return result
  }

  additionExpression(
    ctx: {
      lhs: CstNode | CstNode[]
      rhs: any[]
      AdditionOperator: { [x: string]: any }
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'number'
    const childrenType: FormulaType = 'number'
    const typeError = runtimeCheckType(args.type, parentType, 'additionExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }

    let result: AnyTypeResult = this.visit(ctx.lhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      if (result.type === 'Error') {
        return
      }
      const rhsValue = this.visit(rhsOperand, newArgs)

      if (rhsValue.type === 'Error') {
        result = rhsValue
        return
      }

      const operator = ctx.AdditionOperator[idx]
      const lhsResult = result.result as number
      const rhsResult = rhsValue.result as number

      if (tokenMatcher(operator, Plus)) {
        result = { result: lhsResult + rhsResult, type: 'number' }
      } else if (tokenMatcher(operator, Minus)) {
        result = { result: lhsResult - rhsResult, type: 'number' }
      } else {
        throw new Error(`Unexpected operator ${operator.image}`)
      }
    })

    return result
  }

  multiplicationExpression(
    ctx: {
      lhs: CstNode | CstNode[]
      rhs: any[]
      MultiplicationOperator: { [x: string]: any }
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    const parentType: FormulaType = 'number'
    const childrenType: FormulaType = 'number'
    const typeError = runtimeCheckType(args.type, parentType, 'multiplicationExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const newArgs = { ...args, type: childrenType }

    let result: AnyTypeResult = this.visit(ctx.lhs, newArgs)

    if (result.type === 'Error') {
      return result
    }

    ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
      if (result.type === 'Error') {
        return
      }
      const rhsValue = this.visit(rhsOperand, newArgs)

      if (rhsValue.type === 'Error') {
        result = rhsValue
        return
      }
      const operator = ctx.MultiplicationOperator[idx]

      const lhsResult = result.result as number
      const rhsResult = rhsValue.result as number

      if (tokenMatcher(operator, Multi)) {
        result = { result: lhsResult * rhsResult, type: 'number' }
      } else if (tokenMatcher(operator, Div)) {
        if (rhsValue.result === 0) {
          result = { type: 'Error', result: 'Division by zero', errorKind: 'runtime' }
        } else {
          result = { result: lhsResult / rhsResult, type: 'number' }
        }
      } else if (tokenMatcher(operator, Caret)) {
        result = { result: lhsResult ** rhsResult, type: 'number' }
      } else {
        throw new Error(`Unexpected operator ${operator.image}`)
      }
    })

    return result
  }

  // TODO runtime type check
  chainExpression(ctx: { lhs: CstNode | CstNode[]; rhs: any[] }, args: ExpressionArgument): AnyTypeResult {
    if (!ctx.rhs) {
      return this.visit(ctx.lhs, args)
    }

    let result: AnyTypeResult = this.visit(ctx.lhs, { ...args, type: 'any' })

    ctx.rhs.every(cst => {
      if (cst.name === 'FunctionCall') {
        if (result.type === 'Error') {
          return false
        }
        result = this.visit(cst, { ...args, chainArgs: result })
        return true
      }

      if (cst.name === 'keyExpression') {
        const { result: key } = this.visit(cst, { ...args, type: 'any' })

        if (result.type === 'Error' && ['errorKind', 'result'].includes(key)) {
          result = { type: 'string', result: result[key as 'errorKind' | 'result'] }

          return true
        }

        if (result.type === 'Block') {
          const name = key
          const variable = this.ctx.formulaContext.findVariableByName(result.result.id, name)
          if (!variable) {
            result = { type: 'Error', result: `Variable "${name}" not found`, errorKind: 'runtime' }
            return true
          }

          if (['constant', 'unknown'].includes(variable.t.kind)) {
            result = variable.t.variableValue.result
            return true
          }

          result = this.visit(variable.t.cst!, args)
          return true
        }

        if (result.type === 'Record') {
          const value = result.result[key]
          if (value) {
            result = value
          } else {
            result = { type: 'Error', result: `Key ${key} not found`, errorKind: 'runtime' }
          }

          return true
        }

        if (result.type === 'Reference') {
          result = { type: 'Reference', result: { ...result.result, attribute: key } }
          return true
        }

        result = { type: 'Error', result: `Access not supported for ${result.type}`, errorKind: 'runtime' }
        return true
      }

      // TODO remove this
      if (cst.tokenType.name === 'UUID') {
        if (result.type === 'Error') {
          return true
        }

        const key = cst.image
        if (result.type === 'Block') {
          if (args?.lazy) {
            result = { type: 'Reference', result: { kind: 'variable', namespaceId: result.result.id, variableId: key } }
            return true
          }

          const variable = this.ctx.formulaContext.findVariable(result.result.id, key)
          if (!variable) {
            result = { type: 'Error', result: `Variable ${key} not found`, errorKind: 'runtime' }
            return true
          }

          if (['constant', 'unknown'].includes(variable.t.kind)) {
            result = variable.t.variableValue.result
            return true
          }

          result = this.visit(variable.t.cst!, args)
          return true
        }

        if (result.type === 'Spreadsheet') {
          const column = result.result.getColumn(key)
          result = column
            ? { type: 'Column', result: new ColumnClass(result.result, column) }
            : { type: 'Error', result: `Column ${key} not found`, errorKind: 'runtime' }
          return true
        }

        result = { type: 'Error', result: `Access not supported for ${result.type}`, errorKind: 'runtime' }
        return true
      }

      throw new Error(`Unexpected CST node ${cst.name}`)
    })

    const typeError = runtimeCheckType(args.type, result.type, 'chainExpression', this.ctx)
    if (typeError) {
      return typeError
    }

    return result
  }

  keyExpression(ctx: any, args: ExpressionArgument): AnyTypeResult {
    if (ctx.FunctionName) {
      return this.FunctionNameExpression(ctx, args)
    } else if (ctx.StringLiteral) {
      return this.StringLiteralExpression(ctx, args)
    } else {
      throw new Error('Unexpected key expression')
    }
  }

  simpleAtomicExpression(
    ctx: {
      parenthesisExpression: CstNode | CstNode[]
      arrayExpression: CstNode | CstNode[]
      recordExpression: CstNode | CstNode[]
      constantExpression: CstNode | CstNode[]
      FunctionCall: CstNode | CstNode[]
      lazyVariableExpression: CstNode | CstNode[]
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (ctx.parenthesisExpression) {
      return this.visit(ctx.parenthesisExpression, args)
    } else if (ctx.arrayExpression) {
      return this.visit(ctx.arrayExpression, args)
    } else if (ctx.recordExpression) {
      return this.visit(ctx.recordExpression, args)
    } else if (ctx.constantExpression) {
      return this.visit(ctx.constantExpression, args)
    } else if (ctx.FunctionCall) {
      return this.visit(ctx.FunctionCall, args)
    } else if (ctx.lazyVariableExpression) {
      return this.visit(ctx.lazyVariableExpression, args)
    } else {
      // devLog({ ctx })
      throw new Error('unsupported expression')
    }
  }

  atomicExpression(
    ctx: {
      simpleAtomicExpression: CstNode | CstNode[]
      blockExpression: CstNode | CstNode[]
      referenceExpression: CstNode | CstNode[]
      predicateExpression: CstNode | CstNode[]
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (ctx.simpleAtomicExpression) {
      return this.visit(ctx.simpleAtomicExpression, args)
    } else if (ctx.referenceExpression) {
      return this.visit(ctx.referenceExpression, args)
    } else if (ctx.blockExpression) {
      return this.visit(ctx.blockExpression, args)
    } else if (ctx.predicateExpression) {
      return this.visit(ctx.predicateExpression, args)
    } else {
      // devLog({ ctx })
      throw new Error('unsupported expression')
    }
  }

  predicateExpression(
    ctx: {
      EqualCompareOperator: IToken[]
      CompareOperator: IToken[]
      simpleAtomicExpression: CstNode | CstNode[]
    },
    args: ExpressionArgument
  ): PredicateResult | ErrorResult {
    const parentType: FormulaType = 'Predicate'
    const typeError = runtimeCheckType(args.type, parentType, 'predicateExpression', this.ctx)
    if (typeError) {
      return typeError
    }

    let operator: PredicateOperator
    let token: IToken
    if (ctx.EqualCompareOperator) {
      token = ctx.EqualCompareOperator[0]
    } else {
      token = ctx.CompareOperator[0]
    }

    if (tokenMatcher(token, Equal) || tokenMatcher(token, Equal2)) {
      operator = 'equal'
    } else if (tokenMatcher(token, NotEqual) || tokenMatcher(token, NotEqual2)) {
      operator = 'notEqual'
    } else if (tokenMatcher(token, LessThan)) {
      operator = 'lessThan'
    } else if (tokenMatcher(token, GreaterThan)) {
      operator = 'greaterThan'
    } else if (tokenMatcher(token, LessThanEqual)) {
      operator = 'lessThanEqual'
    } else if (tokenMatcher(token, GreaterThanEqual)) {
      operator = 'greaterThanEqual'
    } else {
      throw new Error(`Unexpected operator ${token.image}`)
    }

    const result = this.visit(ctx.simpleAtomicExpression, { ...args, type: ['number', 'string'] })
    if (result.type === 'Error') {
      return result
    }

    return { type: 'Predicate', result, operator }

    // if (!ctx.variableExpression) {
    // }

    // const { type, result: column } = this.visit(ctx.variableExpression, { ...args, type: 'Column' })
    // if (type === 'Column') {
    //   return { type: 'Predicate', result, operator, column }
    // }

    // return { type: 'Error', result: 'Not found', errorKind: 'runtime' }
  }

  arrayExpression(ctx: { Arguments: CstNode | CstNode[] }, args: ExpressionArgument): AnyTypeResult {
    const parentType: FormulaType = 'Array'
    const typeError = runtimeCheckType(args.type, parentType, 'arrayExpression', this.ctx)
    if (typeError) {
      return typeError
    }

    const arrayArgs: AnyTypeResult[] = []

    if (ctx.Arguments) {
      arrayArgs.push(...this.visit(ctx.Arguments, { ...args, type: 'any', finalTypes: [] }))
    }

    return { type: 'Array', subType: extractSubType(arrayArgs), result: arrayArgs }
  }

  recordExpression(ctx: any, args: ExpressionArgument): AnyTypeResult {
    const parentType: FormulaType = 'Record'
    const typeError = runtimeCheckType(args.type, parentType, 'recordExpression', this.ctx)
    if (typeError) {
      return typeError
    }

    if (!ctx.recordField) {
      return { type: 'Record', subType: 'void', result: {} }
    }

    const result: Record<string, AnyTypeResult> = {}
    ctx.recordField.forEach((c: CstNode | CstNode[]) => {
      const { key, value } = this.visit(c, { ...args, type: 'any' })
      result[key] = value
    })

    return { type: 'Record', subType: extractSubType(Object.values(result)), result }
  }

  recordField(ctx: any, args: ExpressionArgument): { key: string; value: AnyTypeResult } {
    const { result: key } = this.visit(ctx.keyExpression, { ...args, type: 'string' })
    const value = this.visit(ctx.expression, { ...args, type: 'any' })

    return { key, value }
  }

  parenthesisExpression(ctx: { expression: CstNode | CstNode[] }, args: ExpressionArgument): AnyTypeResult {
    return this.visit(ctx.expression, args)
  }

  StringLiteralExpression(
    ctx: {
      NumberLiteralExpression?: CstNode | CstNode[]
      BooleanLiteralExpression?: CstNode | CstNode[]
      NullLiteral?: CstNode | CstNode[]
      StringLiteral: any
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    const parentType: FormulaType = 'string'
    const typeError = runtimeCheckType(args.type, parentType, 'StringLiteralExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    const str = ctx.StringLiteral[0].image
    return { result: parseString(str), type: 'string' }
  }

  FunctionNameExpression(ctx: { FunctionName: Array<{ image: any }> }, args: ExpressionArgument): AnyTypeResult {
    const parentType: FormulaType = 'string'
    const typeError = runtimeCheckType(args.type, parentType, 'FunctionNameExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    return { result: ctx.FunctionName[0].image, type: 'string' }
  }

  constantExpression(
    ctx: {
      NumberLiteralExpression: CstNode | CstNode[]
      BooleanLiteralExpression: CstNode | CstNode[]
      NullLiteral: CstNode | CstNode[]
      StringLiteral: Array<{ image: any }>
    },
    args: ExpressionArgument
  ): AnyTypeResult {
    if (ctx.NumberLiteralExpression) {
      return this.visit(ctx.NumberLiteralExpression, args)
    } else if (ctx.BooleanLiteralExpression) {
      return this.visit(ctx.BooleanLiteralExpression, args)
    } else if (ctx.NullLiteral) {
      const parentType: FormulaType = 'null'
      const typeError = runtimeCheckType(args.type, parentType, 'constantExpression', this.ctx)
      if (typeError) {
        return typeError
      }

      return { type: 'null', result: null }
    } else if (ctx.StringLiteral) {
      return this.StringLiteralExpression(ctx, args)
    } else {
      throw new Error('unsupported expression')
    }
  }

  blockExpression(
    ctx: { UUID: Array<{ image: any }> },
    args: ExpressionArgument
  ): SpreadsheetResult | BlockResult | NullResult | ErrorResult {
    const namespaceId = ctx.UUID[0].image
    const formulaName = this.ctx.formulaContext.findFormulaName(namespaceId)

    if (formulaName?.kind === 'Spreadsheet') {
      const parentType: FormulaType = 'Spreadsheet'
      const typeError = runtimeCheckType(args.type, parentType, 'blockExpression', this.ctx)
      if (typeError) {
        return typeError
      }

      const spreadsheet = this.ctx.formulaContext.findSpreadsheet(namespaceId)
      if (!spreadsheet) {
        return { type: 'Error', result: `Spreadsheet ${namespaceId} not found`, errorKind: 'runtime' }
      }
      return { type: 'Spreadsheet', result: spreadsheet }
    }

    if (formulaName?.kind === 'Block') {
      const parentType: FormulaType = 'Block'
      const typeError = runtimeCheckType(args.type, parentType, 'blockExpression', this.ctx)
      if (typeError) {
        return typeError
      }

      const block = new BlockClass(this.ctx.formulaContext, { id: namespaceId })
      return { type: 'Block', result: block }
    }

    return { type: 'null', result: null }
  }

  // TODO runtime type check
  referenceExpression(ctx: { lazyVariableExpression: CstNode | CstNode[] }, args: ExpressionArgument): ReferenceResult {
    return this.visit(ctx.lazyVariableExpression, { ...args, type: 'any', lazy: true })
  }

  lazyVariableExpression(ctx: any, args: ExpressionArgument): AnyTypeResult {
    if (ctx.Self) {
      // TODO runtime type check
      return { type: 'Reference', result: { kind: 'self' } }
    } else if (ctx.LambdaArgumentNumber) {
      // TODO runtime type check
      const number = Number(ctx.LambdaArgumentNumber[0].image.substring(1))
      const result = this.ctx.interpretContext.arguments[number - 1]

      if (result) {
        return result
      }
      return { type: 'Error', result: `Argument ${number} not found`, errorKind: 'runtime' }
    } else if (ctx.Input) {
      const parentType: FormulaType = 'Record'
      const typeError = runtimeCheckType(args.type, parentType, 'lazyVariableExpression', this.ctx)
      if (typeError) {
        return typeError
      }
      return {
        type: 'Record',
        subType: extractSubType(Object.values(this.ctx.interpretContext.ctx)),
        result: this.ctx.interpretContext.ctx
      }
    } else {
      // devLog({ ctx })
      throw new Error('unsupported expression')
    }
  }

  NumberLiteralExpression(
    ctx: { NumberLiteral: Array<{ image: any }>; Sign: any; Minus: any },
    args: ExpressionArgument
  ): NumberResult | ErrorResult {
    const parentType: FormulaType = 'number'
    const typeError = runtimeCheckType(args.type, parentType, 'NumberLiteralExpression', this.ctx)
    if (typeError) {
      return typeError
    }

    const number = Number(ctx.NumberLiteral[0].image)
    const numberAfterSign = ctx.Sign ? number * 0.01 : number

    return { result: ctx.Minus ? numberAfterSign * -1 : numberAfterSign, type: 'number' }
  }

  BooleanLiteralExpression(
    ctx: { BooleanLiteral: Array<{ image: string }> },
    args: ExpressionArgument
  ): BooleanResult | ErrorResult {
    const parentType: FormulaType = 'boolean'
    const typeError = runtimeCheckType(args.type, parentType, 'BooleanLiteralExpression', this.ctx)
    if (typeError) {
      return typeError
    }
    return { result: ['true'].includes(ctx.BooleanLiteral[0].image), type: 'boolean' }
  }

  FunctionCall(
    ctx: {
      FunctionName: Array<{ image: any }>
      Arguments: CstNode[]
    },
    args: ExpressionArgument
  ): AnyTypeResult | Promise<AnyTypeResult> {
    const chainArgs = args?.chainArgs
    const names = ctx.FunctionName.map(group => group.image)
    const [group, name] = names.length === 1 ? ['core', ...names] : names

    const clause = this.ctx.formulaContext.findFunctionClause(group, name)

    const functionKey = buildFunctionKey(group, name)

    if (!clause) {
      throw new Error(`Function ${functionKey} not found`)
    }

    if (clause.feature && !this.ctx.formulaContext.features.includes(clause.feature)) {
      throw new Error(`Feature ${clause.feature} not enabled`)
    }

    const typeError = runtimeCheckType(args.type, clause.returns, 'FunctionCall', this.ctx)
    if (typeError) {
      return typeError
    }

    let functionArgs: AnyTypeResult[] = []

    if (clause.chain && chainArgs) {
      const firstArgs = clause.args[0]
      const typeError = runtimeCheckType(chainArgs.type, firstArgs.type, 'FunctionCallFirstArg', this.ctx)
      if (typeError) {
        return typeError
      }

      functionArgs.push(chainArgs)
    }

    if (clause.lazy) {
      // TODO runtime type check
      const argsTypes = clause.args.map(arg => arg.type)

      if (!ctx.Arguments || !ctx.Arguments[0].children?.expression) {
        return { type: 'Error', result: 'Function is empty', errorKind: 'runtime' }
      }

      ctx.Arguments[0].children?.expression.forEach((e: CstElement, index: number) => {
        const argType = argsTypes[clause.chain && chainArgs ? index + 1 : index]

        const element = e as CstNode

        if (argType === 'Cst') {
          this.lazy = true
          functionArgs.push({ type: 'Cst', result: element })
        } else {
          functionArgs.push(this.visit(element, { lazy: argType === 'Reference' }))
        }
      })
    } else {
      if (ctx.Arguments) {
        const clauseArguments = clause.chain && chainArgs ? clause.args.slice(1) : clause.args
        const argResult = this.visit(ctx.Arguments, { ...args, finalTypes: clauseArguments.map(e => e.type) })
        functionArgs.push(...argResult)
      }

      const argsTypes: Argument[] = clause.args[0]?.spread
        ? Array(functionArgs.length).fill(clause.args[0])
        : clause.args

      if (!clause.acceptError) {
        const errorArgs = functionArgs.find(a => a.type === 'Error')
        if (errorArgs) {
          return errorArgs as AnyTypeResult
        }
      }

      functionArgs = argsTypes.map((argType, index) => {
        const v = functionArgs[index] || argType.default
        if (!v) {
          throw new Error(`Argument ${index} is not defined`)
        }

        if (argType.type === 'Predicate' && ['number', 'string'].includes(v.type)) {
          return { type: 'Predicate', result: v as PredicateResult['result'], operator: 'equal' }
        } else {
          return v
        }
      })
    }

    // devLog({ args })

    return clause.reference(this.ctx, ...functionArgs)
  }

  Arguments(ctx: { expression: any[] }, args: ExpressionArgument): AnyTypeResult[] {
    return ctx.expression.map((arg: CstNode | CstNode[], index: number) => {
      const type = args.finalTypes[index] ?? 'any'
      return this.visit(arg, { ...args, type })
    })
  }
}
