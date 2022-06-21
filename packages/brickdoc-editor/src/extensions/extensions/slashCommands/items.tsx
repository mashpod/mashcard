import Paragraph from '@tiptap/extension-paragraph'
import { SlashMenuItem } from '../../../components/extensionViews'
import { BlockCommandItem } from '../../../helpers/block'
import * as BLOCK from '../../../helpers/block'
import { getRecentItemKey } from './recentItemsManager'
import { meta as spreadsheetMeta } from '../../blocks/spreadsheet/meta'
import { meta as embedMeta } from '../../blocks/embed/meta'
import { meta as subPageMenuMeta } from '../../blocks/subPageMenu/meta'
import { meta as tocMeta } from '../../blocks/toc/meta'
import { meta as horizontalRuleMeta } from '../../blocks/horizontalRule/meta'

const unselectableBlockType = [
  embedMeta.name,
  horizontalRuleMeta.name,
  tocMeta.name,
  subPageMenuMeta.name,
  spreadsheetMeta.name
]

function createSlashMenuItem(blockItem: BlockCommandItem): SlashMenuItem {
  return {
    key: blockItem.key,
    alias: blockItem.alias,
    icon: blockItem.squareIcon,
    command: ({ editor, range }: Parameters<SlashMenuItem['command']>[0]) => {
      let chain = editor.chain().focus().deleteRange(range)
      chain = blockItem.setBlock(chain)

      // create a new line to prevent block from selected
      if (unselectableBlockType.includes(blockItem.blockType)) {
        chain = chain.insertBlockAt({ type: Paragraph.name }, range.from).focus()
      }

      chain.run()
    }
  }
}

const FORMULA = createSlashMenuItem(BLOCK.FORMULA)
const SPREADSHEET = createSlashMenuItem(BLOCK.SPREADSHEET)
const UPLOAD = createSlashMenuItem(BLOCK.UPLOAD)
const GALLERY = createSlashMenuItem(BLOCK.GALLERY)
const LINK = createSlashMenuItem(BLOCK.LINK)
const EMBED = createSlashMenuItem(BLOCK.EMBED)
const HEADING_1 = createSlashMenuItem(BLOCK.HEADING_1)
const HEADING_2 = createSlashMenuItem(BLOCK.HEADING_2)
const HEADING_3 = createSlashMenuItem(BLOCK.HEADING_3)
const HEADING_4 = createSlashMenuItem(BLOCK.HEADING_4)
const HEADING_5 = createSlashMenuItem(BLOCK.HEADING_5)
const BULLETED_LIST = createSlashMenuItem(BLOCK.BULLETED_LIST)
const ORDERED_LIST = createSlashMenuItem(BLOCK.ORDERED_LIST)
const TASK_LIST = createSlashMenuItem(BLOCK.TASK_LIST)
const CODE = createSlashMenuItem(BLOCK.CODE)
const BLOCKQUOTE = createSlashMenuItem(BLOCK.BLOCKQUOTE)
const CALLOUT = createSlashMenuItem(BLOCK.CALLOUT)
const DIVIDER = createSlashMenuItem(BLOCK.DIVIDER)
const TOC = createSlashMenuItem(BLOCK.TOC)
const SUB_PAGE_MENU = createSlashMenuItem(BLOCK.SUB_PAGE_MENU)

export const slashMenuGroup = [
  {
    key: 'data',
    items: [FORMULA, SPREADSHEET]
  },
  {
    key: 'embed',
    items: [UPLOAD, LINK, EMBED, GALLERY]
  },
  {
    key: 'text',
    items: [
      HEADING_1,
      HEADING_2,
      HEADING_3,
      HEADING_4,
      HEADING_5,
      BULLETED_LIST,
      ORDERED_LIST,
      TASK_LIST,
      CODE,
      BLOCKQUOTE,
      CALLOUT
    ]
  },
  {
    key: 'others',
    items: [DIVIDER, TOC, SUB_PAGE_MENU]
  }
]

const slashMenuItems = [
  FORMULA,
  SPREADSHEET,
  UPLOAD,
  LINK,
  EMBED,
  HEADING_1,
  HEADING_2,
  HEADING_3,
  HEADING_4,
  HEADING_5,
  BULLETED_LIST,
  ORDERED_LIST,
  TASK_LIST,
  CODE,
  BLOCKQUOTE,
  CALLOUT,
  DIVIDER,
  TOC,
  SUB_PAGE_MENU
]

export const TYPE_ITEMS: SlashMenuItem[] = slashMenuItems

const RECENT_COUNT = 6

export const getRecentItems = (): SlashMenuItem[] => {
  return getRecentItemKey()
    .map(key => slashMenuItems.find(i => i.key === key))
    .filter(i => !!i)
    .slice(0, RECENT_COUNT) as SlashMenuItem[]
}

const SUGGESTION_COUNT = 5

export const getSuggestionItems = (query: string): SlashMenuItem[] => {
  if (!query) return []
  return slashMenuItems
    .filter(item => [item.key, ...(item.alias ?? [])].some(name => name.toLowerCase().startsWith(query.toLowerCase())))
    .slice(0, SUGGESTION_COUNT)
}
