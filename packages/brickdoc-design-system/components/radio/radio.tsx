import * as React from 'react'
import RcCheckbox from 'rc-checkbox'
import classNames from 'classnames'
import { composeRef } from 'rc-util/lib/ref'
import { RadioProps, RadioChangeEvent } from './interface'
import { ConfigContext } from '../config-provider'
import RadioGroupContext from './context'

const InternalRadio: React.ForwardRefRenderFunction<HTMLElement, RadioProps> = (props, ref) => {
  const context = React.useContext(RadioGroupContext)
  const { getPrefixCls, direction } = React.useContext(ConfigContext)
  const innerRef = React.useRef<HTMLElement>()
  const mergedRef = composeRef(ref, innerRef)

  const onChange = (e: RadioChangeEvent) => {
    props.onChange?.(e)
    context?.onChange?.(e)
  }

  const { prefixCls: customizePrefixCls, className, children, style, ...restProps } = props
  const prefixCls = getPrefixCls('radio', customizePrefixCls)
  const radioProps: RadioProps = { ...restProps }
  if (context) {
    radioProps.name = context.name
    radioProps.onChange = onChange
    radioProps.checked = props.value === context.value
    radioProps.disabled = props.disabled || context.disabled
  }
  const wrapperClassString = classNames(
    `${prefixCls}-wrapper`,
    {
      [`${prefixCls}-wrapper-checked`]: radioProps.checked,
      [`${prefixCls}-wrapper-disabled`]: radioProps.disabled,
      [`${prefixCls}-wrapper-rtl`]: direction === 'rtl'
    },
    className
  )

  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label className={wrapperClassString} style={style} onMouseEnter={props.onMouseEnter} onMouseLeave={props.onMouseLeave}>
      {/* @ts-expect-error */}
      <RcCheckbox {...radioProps} prefixCls={prefixCls} ref={mergedRef} />
      {children !== undefined ? <span>{children}</span> : null}
    </label>
  )
}

const Radio = React.forwardRef<HTMLElement, RadioProps>(InternalRadio)

Radio.displayName = 'Radio'

Radio.defaultProps = {
  type: 'radio'
}

export default Radio
