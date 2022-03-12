import Paragraph, { ParagraphOptions } from '@tiptap/extension-paragraph'
import { BlockViewProps, ExtensionMeta } from '../../common'

export const meta: ExtensionMeta = {
  name: Paragraph.name,
  extensionType: 'block'
}

export type { ParagraphOptions } from '@tiptap/extension-paragraph'
export interface ParagraphAttributes {}

export interface ParagraphViewProps extends BlockViewProps<ParagraphOptions, ParagraphAttributes> {}
