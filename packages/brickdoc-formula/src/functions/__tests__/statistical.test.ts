import { FormulaContext } from '../../context'
import { VariableMetadata } from '../../types'
import { AVERAGE } from '../statistical'

const meta: VariableMetadata = {
  namespaceId: '57622108-1337-4edd-833a-2557835bcfe0',
  variableId: '481b6dd1-e668-4477-9e47-cfe5cb1239d0',
  name: 'v',
  input: '=24',
  position: 0,
  richType: { type: 'normal' }
}

const ctx = {
  formulaContext: new FormulaContext({ domain: 'test' }),
  interpretContext: {
    ctx: {},
    arguments: []
  },
  meta
}

describe('statistical', () => {
  it('AVERAGE', () => {
    expect(AVERAGE(ctx).result).toBe(NaN)
    expect(
      AVERAGE(ctx, { result: 1, type: 'number' }, { result: 2, type: 'number' }, { result: 3, type: 'number' }).result
    ).toBe(2)
  })
})
