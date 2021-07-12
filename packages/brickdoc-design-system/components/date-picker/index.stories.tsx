import React from 'react'
import { Story } from '@storybook/react'
import { DatePicker, DatePickerProps } from '../'

export default {
  title: 'ReactComponents/DatePicker',
  component: DatePicker,
  parameters: {
    docs: {
      description: {
        component: `
To select or input a date.

#### When To Use

By clicking the input box, you can select a date from a popup calendar.


### Common API

The following APIs are shared by DatePicker, RangePicker.

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| allowClear | Whether to show clear button | boolean | true |
| autoFocus | If get focus when component mounted | boolean | false |
| bordered | Whether has border style | boolean | true |
| className | The picker className | string | - |
| dateRender | Custom rendering function for date cells | function(currentDate: Date, today: Date) => React.ReactNode | - |
| disabled | Determine whether the DatePicker is disabled | boolean | false |
| disabledDate | Specify the date that cannot be selected | (currentDate: Date) => boolean | - |
| dropdownClassName | To customize the className of the popup calendar | string | - |
| getPopupContainer | To set the container of the floating layer, while the default is to create a \`div\` element in \`body\` | function(trigger) | - |
| inputReadOnly | Set the \`readonly\` attribute of the input tag (avoids virtual keyboard on touch devices) | boolean | false |
| locale | Localization configuration | object | default |
| mode | The picker panel mode | \`time\` \\| \`date\` \\| \`month\` \\| \`year\` \\| \`decade\` | - |
| open | The open state of picker | boolean | - |
| panelRender | Customize panel render | (panelNode) => ReactNode | - |
| picker | Set picker type | \`date\` \\| \`week\` \\| \`month\` \\| \`quarter\` \\| \`year\` | \`date\` |
| placeholder | The placeholder of date input | string \\| \\[string,string] | - |
| popupStyle | To customize the style of the popup calendar | CSSProperties | {} |
| size | To determine the size of the input box, the height of \`large\` and \`small\`, are 40px and 24px respectively, while default size is 32px | \`large\` \\| \`middle\` \\| \`small\` | - |
| style | To customize the style of the input box | CSSProperties | {} |
| suffixIcon | The custom suffix icon | ReactNode | - |
| onOpenChange | Callback function, can be executed whether the popup calendar is popped up or closed | function(open) | - |
| onPanelChange | Callback when picker panel mode is changed | function(value, mode) | - |

### Common Methods

| Name    | Description  |
| ------- | ------------ |
| blur()  | Remove focus |
| focus() | Get focus    |

### DatePicker

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| defaultPickerValue | To set default picker date | Date | - |
| defaultValue | To set default date, if start time or end time is null or undefined, the date range will be an open interval | Date | - |
| disabledTime | To specify the time that cannot be selected | function(date) | - |
| format | To set the date format, refer to [date-fns](https://date-fns.org/). When an array is provided, all values are used for parsing and first value is used for formatting, support Custom Format | string \\| (value: Date) => string \\| (string \\| (value: Date) => string)\\[] | \`YYYY-MM-DD\` |
| renderExtraFooter | Render extra footer in panel | (mode) => React.ReactNode | - |
| showNow | Whether to show 'Now' button on panel when \`showTime\` is set | boolean | - |
| showTime | To provide an additional time selection | object \\| boolean | TimePicker Options |
| showTime.defaultValue | To set default time of selected date | Date | Date() |
| showToday | Whether to show \`Today\` button | boolean | true |
| value | To set date | Date | - |
| onChange | Callback function, can be executed when the selected time is changing | function(date: Date, dateString: string) | - |
| onOk | Callback when click ok button | function() | - |
| onPanelChange | Callback function for panel changing | function(value, mode) | - |

### DatePicker\\[picker=year]

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| defaultPickerValue | To set default picker date | Date |
| defaultValue | To set default date | Date | - |
| format | To set the date format, refer to [date-fns](https://date-fns.org/) | string | \`YYYY\` |
| renderExtraFooter | Render extra footer in panel | () => React.ReactNode | - |
| value | To set date | Date | - |
| onChange | Callback function, can be executed when the selected time is changing | function(date: Date, dateString: string) | - |

### DatePicker\\[picker=quarter]


| Property | Description | Type | Default |
| --- | --- | --- | --- |
| defaultPickerValue | To set default picker date | Date | - |
| defaultValue | To set default date | Date | - |
| format | To set the date format, refer to [date-fns](https://date-fns.org/) | string | \`YYYY-\\QQ\` |
| renderExtraFooter | Render extra footer in panel | () => React.ReactNode | - |
| value | To set date | Date | - |
| onChange | Callback function, can be executed when the selected time is changing | function(date: Date, dateString: string) | - |

### DatePicker\\[picker=month]

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| defaultPickerValue | To set default picker date | Date | - |
| defaultValue | To set default date | Date | - |
| format | To set the date format, refer to [date-fns](https://date-fns.org/) | string | \`YYYY-MM\` |
| monthCellRender | Custom month cell content render method | function(date, locale): ReactNode | - |
| renderExtraFooter | Render extra footer in panel | () => React.ReactNode | - |
| value | To set date | Date | - |
| onChange | Callback function, can be executed when the selected time is changing | function(date: Date, dateString: string) | - |

### DatePicker\\[picker=week]

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| defaultPickerValue | To set default picker date | Date | - |
| defaultValue | To set default date | Date | - |
| format | To set the date format, refer to [date-fns](https://date-fns.org/) | string | \`YYYY-wo\` |
| renderExtraFooter | Render extra footer in panel | (mode) => React.ReactNode | - |
| value | To set date | Date | - |
| onChange | Callback function, can be executed when the selected time is changing | function(date: Date, dateString: string) | - |

### RangePicker

| Property | Description | Type | Default |
| --- | --- | --- | --- | --- |
| allowEmpty | Allow start or end input leave empty | \\[boolean, boolean] | \\[false, false] |
| dateRender | Customize date cell.  | function(currentDate: Date, today: Date, info: { range: \`start\` \\| \`end\` }) => React.ReactNode | - |
| defaultPickerValue | To set default picker date | \\[Date, Date] | - |
| defaultValue | To set default date | \\[Date, Date] | - |
| disabled | If disable start or end | \\[boolean, boolean] | - |  |
| disabledTime | To specify the time that cannot be selected | function(date: Date, partial: \`start\` \\| \`end\`) | - |
| format | To set the date format, refer to [date-fns](https://date-fns.org/). When an array is provided, all values are used for parsing and first value is used for formatting | string \\| string\\[] | \`YYYY-MM-DD HH:mm:ss\` |
| ranges | The preseted ranges for quick selection | { \\[range: string]: Date\\[] } \\| { \\[range: string]: () => Date\\[] } | - |
| renderExtraFooter | Render extra footer in panel | () => React.ReactNode | - |
| separator | Set separator between inputs | string | \`~\` |
| showTime | To provide an additional time selection | object \\| boolean | TimePicker Options |
| showTime.defaultValue | To set default time of selected date | Date\\[] | \\[Date(), Date()] |
| value | To set date | \\[Date, Date] | - |
| onCalendarChange | Callback function, can be executed when the start time or the end time of the range is changing. \`info\` argument is added in 4.4.0 | function(dates: \\[Date, Date], dateStrings: \\[string, string], info: { range:\`start\`\\|\`end\` }) | - |
| onChange | Callback function, can be executed when the selected time is changing | function(dates: \\[Date, Date], dateStrings: \\[string, string]) | - |
`
      }
    }
  }
}

const Template: Story<DatePickerProps> = _args => (
  <>
    <DatePicker />
    <br />
    <br />
    <DatePicker picker="week" />
    <br />
    <br />
    <DatePicker picker="month" bordered={false} />
    <br />
    <br />
    <DatePicker.RangePicker showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />
    <br />
    <br />
    <DatePicker picker="quarter" size="large" />
  </>
)
export const Base = Template.bind({})
