import React from 'react'
import { Story } from '@storybook/react'
import { Input, InputProps, Select } from '../'
import { User } from '../icon'

export default {
  title: 'ReactComponents/Input',
  component: Input,
  parameters: {
    docs: {
      description: {
        component: `
A basic widget for getting the user input is a text field.
Keyboard and mouse can be used for providing or changing data.

#### When To Use

* A user input in a form field is needed.
* A search input is required.


#### API

##### Input

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| addonAfter | The label text displayed after (on the right side of) the input field | ReactNode | - |
| addonBefore | The label text displayed before (on the left side of) the input field | ReactNode | - |
| allowClear | If allow to remove input content with clear icon | boolean | false |  |
| bordered | Whether has border style | boolean | true | 4.5.0 |
| defaultValue | The initial input content | string | - |
| disabled | Whether the input is disabled | boolean | false |  |
| id | The ID for input | string | - |
| maxLength | The max length | number | - |
| prefix | The prefix icon for the Input | ReactNode | - |
| size | The size of the input box. Note: in the context of a form, the \`large\` size is used | \`large\` \\| \`middle\` \\| \`small\` | - |
| suffix | The suffix icon for the Input | ReactNode | - |
| type | The type of input, see: [MDN](https://developer.mozilla.org/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types)( use \`Input.TextArea\` instead of \`type="textarea"\`) | string | \`text\` |  |
| value | The input content value | string | - |
| onChange | Callback when user input | function(e) | - |
| onPressEnter | The callback function that is triggered when Enter key is pressed | function(e) | - |

> When \`Input\` is used in a \`Form.Item\` context, if the \`Form.Item\` has the \`id\` and \`options\` props defined then \`value\`, \`defaultValue\`, and \`id\` props of \`Input\` are automatically set.

The rest of the props of Input are exactly the same as the original [input](https://reactjs.org/docs/dom-elements.html#all-supported-html-attributes).

##### Input.TextArea

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| allowClear | If allow to remove input content with clear icon | boolean | false |  |
| autoSize | Height autosize feature, can be set to true \\| false or an object { minRows: 2, maxRows: 6 } | boolean \\| object | false |  |
| bordered | Whether has border style | boolean | true | 4.5.0 |
| defaultValue | The initial input content | string | - |
| maxLength | The max length | number | - | 4.7.0 |
| showCount | Whether show text count | boolean \\| { formatter: ({ count: number, maxLength?: number }) => string } | false |
| value | The input content value | string | - |
| onPressEnter | The callback function that is triggered when Enter key is pressed | function(e) | - |
| onResize | The callback function that is triggered when resize | function({ width, height }) | - |

The rest of the props of \`Input.TextArea\` are the same as the original [textarea](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea).

##### Input.Search

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| enterButton | Whether to show an enter button after input. This property conflicts with the \`addonAfter\` property | boolean \\| ReactNode | false |
| loading | Search box with loading | boolean | false |
| onSearch | The callback function triggered when you click on the search-icon, the clear-icon or press the Enter key | function(value, event) | - |

Supports all props of \`Input\`.

##### Input.Group

| Property | Description | Type | Default |
| --- | --- | --- | --- |
| compact | Whether use compact style | boolean | false |
| size | The size of \`Input.Group\` specifies the size of the included \`Input\` fields. Available: \`large\` \`default\` \`small\` | string | \`default\` |

\`\`\`jsx
<Input.Group>
  <input />
  <input />
</Input.Group>
\`\`\`

##### Input.Password

| Property | Description | Type | Default |
| --- | --- | --- | --- | --- |
| iconRender | Custom toggle button | (visible) => ReactNode | (visible) => (visible ? &lt;EyeOutlined /> : &lt;EyeInvisibleOutlined />) |
| visibilityToggle | Whether show toggle button | boolean | true |  |

##### Input Methods

| Name | Description | Parameters |
| --- | --- | --- | --- |
| blur | Remove focus | - |
| focus | Get focus | (option?: { preventScroll?: boolean, cursor?: 'start' \\| 'end' \\| 'all' }) |

`
      }
    }
  }
}
const { Option } = Select
const { Search, TextArea } = Input

const selectBefore = (
  <Select defaultValue="http://" className="select-before">
    <Option value="http://">http://</Option>
    <Option value="https://">https://</Option>
  </Select>
)
const selectAfter = (
  <Select defaultValue=".com" className="select-after">
    <Option value=".com">.com</Option>
    <Option value=".jp">.jp</Option>
    <Option value=".cn">.cn</Option>
    <Option value=".org">.org</Option>
  </Select>
)

const Template: Story<InputProps> = _args => (
  <>
    <Input placeholder="Basic usage" />
    <br />
    <br />
    <Input size="large" placeholder="large size" prefix={<User />} />
    <br />
    <br />
    <Input addonBefore={selectBefore} addonAfter={selectAfter} defaultValue="mysite" />
    <br />
    <br />
    <Search placeholder="input search text" style={{ width: 200 }} />
    <br />
    <br />
    <TextArea rows={4} />
    <br />
    <br />
    <Input.Password placeholder="input password" />
    <br />
    <br />
    <Input prefix="￥" suffix="RMB" disabled />
    <br />
    <br />
    <Search placeholder="input search text" enterButton="Search" size="large" loading />
    <br />
    <br />
    <Input.Group compact>
      <Select defaultValue="Zhejiang">
        <Option value="Zhejiang">Zhejiang</Option>
        <Option value="Jiangsu">Jiangsu</Option>
      </Select>
      <Input style={{ width: '50%' }} defaultValue="HKE Museum of Art, Ningbo" />
    </Input.Group>
    <br />
    <br />
    <Input placeholder="input with clear icon" allowClear />
  </>
)
export const Base = Template.bind({})
