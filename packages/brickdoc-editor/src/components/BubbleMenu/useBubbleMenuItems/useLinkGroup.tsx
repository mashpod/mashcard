import React from 'react'
import { Icon, Input, toast } from '@brickdoc/design-system'
import { EditorContext } from '../../../context/EditorContext'
import { ToolbarSubMenuOption, ToolbarOption, ToolbarGroupOption } from '../../Toolbar'
import { isBubbleMenuVisible } from './useBubbleMenuItems'

export function useLinkGroup(): [ToolbarOption | ToolbarGroupOption | null] {
  const { t, editor } = React.useContext(EditorContext)
  const href = editor?.getAttributes('link').href
  const [inputLink, setInputLink] = React.useState(href)

  React.useEffect(() => {
    setInputLink(href)
  }, [href])

  const option = React.useMemo<ToolbarOption | ToolbarGroupOption | null>(() => {
    if (!isBubbleMenuVisible(editor)) return null

    const menuItems: ToolbarSubMenuOption['items'] = [
      {
        type: 'item',
        name: 'linkInput',
        content: (
          <Input
            bordered={false}
            value={inputLink}
            onChange={e => {
              setInputLink(e.target.value)
            }}
            placeholder={t('bubble_menu.link.placeholder')}
          />
        )
      }
    ]

    if (inputLink) {
      menuItems.push({
        type: 'item',
        icon: <Icon.Link />,
        name: 'confirm',
        label: t('bubble_menu.link.confirm'),
        onAction: () => {
          editor.chain().focus().setLink({ href: inputLink }).run()
        },
        closeOnAction: true
      })
    }

    if (href) {
      menuItems.push({
        type: 'item',
        icon: <Icon.Copy />,
        name: 'copy',
        label: t('bubble_menu.link.copy'),
        onAction: () => {
          void navigator.clipboard.writeText(href)
          void toast.success(t('copy_hint'))
        },
        closeOnAction: true
      })

      menuItems.push({
        type: 'item',
        icon: <Icon.Delete />,
        name: 'delete',
        label: t('bubble_menu.link.delete'),
        onAction: () => {
          editor.chain().focus().unsetLink().run()
        },
        closeOnAction: true
      })
    }

    const linkGroup: ToolbarGroupOption = {
      type: 'group',
      items: [
        {
          type: 'subMenu',
          name: 'link',
          icon: <Icon.Link />,
          items: menuItems,
          tooltip: t('bubble_menu.link.title') as string
        }
      ]
    }

    return linkGroup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor?.state.selection, inputLink])

  return [option]
}
