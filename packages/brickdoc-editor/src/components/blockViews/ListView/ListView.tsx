import { FC } from 'react'
import { NodeViewContent } from '@tiptap/react'
import { BlockContainer } from '../BlockContainer'
import { BlockViewProps } from '../../../extensions/common'
import { BulletList } from '../../../extensions'

export const ListView: FC<BlockViewProps<{}, {}>> = ({ deleteNode, node, getPos }) => {
  const as = node.type.name === BulletList.name ? 'ul' : 'ol'
  return (
    <BlockContainer
      node={node}
      actionOptions={['cut', 'copy', 'delete']}
      deleteNode={deleteNode}
      contentForCopy={node.textContent}
      getPos={getPos}>
      <NodeViewContent as={as} />
    </BlockContainer>
  )
}
