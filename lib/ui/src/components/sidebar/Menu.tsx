import React, { FunctionComponent, useMemo, ComponentProps } from 'react';
import { styled } from '@storybook/theming';
import { WithTooltip, Icons, TooltipLinkList, Button } from '@storybook/components';

import { HeadingProps } from './Heading';

type MenuButtonProps = ComponentProps<typeof Button> &
  // FIXME: Button should extends from the native <button>
  ComponentProps<'button'> & {
    highlighted: boolean;
  };

const MenuButton = styled(Button)<MenuButtonProps>(({ highlighted, theme }) => ({
  position: 'relative',
  overflow: 'visible',
  padding: 7,

  ...(highlighted && {
    '&:after': {
      content: '""',
      position: 'absolute',
      top: 0,
      right: 0,
      width: 8,
      height: 8,
      borderRadius: 8,
      background: theme.color.positive,
    },
  }),
}));

const SidebarMenuList: FunctionComponent<{
  menu: HeadingProps['menu'];
  onHide: () => void;
}> = ({ menu, onHide }) => {
  const links = useMemo(() => {
    return menu.map(({ onClick, ...rest }) => ({
      ...rest,
      onClick: () => {
        if (onClick) {
          onClick();
        }
        onHide();
      },
    }));
  }, [menu]);
  return <TooltipLinkList links={links} />;
};

export const SidebarMenu: FunctionComponent<{
  menu: HeadingProps['menu'];
  isHighlighted: boolean;
}> = ({ isHighlighted, menu }) => {
  return (
    <WithTooltip
      placement="top"
      trigger="click"
      closeOnClick
      tooltip={({ onHide }) => <SidebarMenuList onHide={onHide} menu={menu} />}
    >
      <MenuButton outline small containsIcon highlighted={isHighlighted} title="Shortcuts">
        <Icons icon="ellipsis" />
      </MenuButton>
    </WithTooltip>
  );
};
