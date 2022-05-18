import { FC, ReactElement } from 'react'
import { styled, theme } from '@brickdoc/design-system'
import { EmbedToolbar, EmbedToolbarProps } from '../EmbedToolbar'

export interface DocumentFooterProps extends Omit<EmbedToolbarProps, 'mode'> {
  icon?: ReactElement | string | null
  name: string
}

const Footer = styled('div', {
  alignItems: 'center',
  background: theme.colors.backgroundPrimary,
  display: 'flex',
  flexDirection: 'row',
  height: '3rem',
  padding: '0 1rem',
  position: 'relative'
})

const Info = styled('div', {
  alignItems: 'center',
  color: theme.colors.typeThirdary,
  display: 'flex',
  flexDirection: 'row',
  fontSize: '.875rem',
  fontWeight: 450,
  lineHeight: '1.375rem'
})

const LinkIcon = styled('img', {
  height: '.875rem',
  marginRight: '.25rem',
  width: '.875rem'
})

export const EmbedToolbarContainer = styled('div', {
  bottom: '.5rem',
  opacity: 0,
  pointerEvents: 'none',
  position: 'absolute',
  right: '.75rem',
  transition: 'opacity 100ms ease-in-out'
})

export const DocumentFooter: FC<DocumentFooterProps> = ({
  url,
  displayName,
  name,
  icon,
  blockType,
  updateEmbedBlockAttributes,
  onFullScreen
}) => (
  <Footer>
    <Info>
      {icon && (typeof icon === 'string' ? <LinkIcon alt="icon" src={icon} /> : icon)}
      {name}
    </Info>
    <EmbedToolbarContainer>
      <EmbedToolbar
        url={url}
        displayName={displayName}
        mode="preview"
        blockType={blockType}
        updateEmbedBlockAttributes={updateEmbedBlockAttributes}
        onFullScreen={onFullScreen}
      />
    </EmbedToolbarContainer>
  </Footer>
)
