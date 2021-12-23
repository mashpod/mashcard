import React from 'react'
import { NodeViewProps } from '@tiptap/react'
import { Avatar } from '@brickdoc/design-system'
import { BlockContainer } from '../../../components'
import { EditorContext } from '../../../context/EditorContext'
import './User.less'

export interface UserProps extends NodeViewProps {}

export const User: React.FC<UserProps> = ({ node }) => {
  const { t } = React.useContext(EditorContext)

  const attributes = node.attrs.people ?? {}
  return (
    <BlockContainer inline={true}>
      <Avatar
        size="small"
        initials={attributes.name ?? attributes.webid}
        src={attributes.avatarUrl ? attributes.avatarUrl : undefined}
        className="brickdoc-user-block-avatar"
      />
      <span className="brickdoc-user-block-name">{attributes.name || t('user_block.anonymous')}</span>
    </BlockContainer>
  )
}
