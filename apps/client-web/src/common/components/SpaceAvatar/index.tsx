import { FC } from 'react'
import { Avatar, AvatarProps } from '@brickdoc/design-system'
import { SpaceType } from '../SpaceCard'
interface SpaceAvatarProps extends AvatarProps {
  space: SpaceType
}
export const SpaceAvatar: FC<SpaceAvatarProps> = ({ space, ...avatarProps }) =>
  space.avatarData?.__typename === 'avatarComp' ? (
    space.avatarData.comp
  ) : (
    <Avatar
      {...avatarProps}
      initials={space.name ?? space.domain}
      src={space.avatarData ? space.avatarData.url : undefined}
    />
  )
