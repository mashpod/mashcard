import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { insertBlockAt } from '../../helpers/commands'
import { PageLink } from '../../components'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageLinkBlock: {
      /**
       * Set a page link block
       */
      setPageLinkBlock: (
        id: string,
        link: string,
        title: string | undefined,
        icon: string | null | undefined
      ) => ReturnType
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PageLinkBlockOptions {}

export const PageLinkBlockExtension = Node.create<PageLinkBlockOptions>({
  name: 'pageLinkBlock',

  inline: true,

  group: 'inline',

  selectable: false,

  addAttributes() {
    return {
      page: {
        default: {
          type: 'PAGE'
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'page-link-block'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['user-block', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageLink)
  },

  addCommands() {
    return {
      setPageLinkBlock:
        (id, link, title, icon) =>
        ({ chain }) => {
          return insertBlockAt(
            {
              type: this.name,
              attrs: {
                page: {
                  type: 'PAGE',
                  key: id,
                  title,
                  link,
                  icon
                }
              }
            },
            chain
          )
        }
    }
  }
})
