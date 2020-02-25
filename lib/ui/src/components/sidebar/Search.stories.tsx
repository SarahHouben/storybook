import React from 'react';
import { actions as makeActions } from '@storybook/addon-actions';

import { Search, PureSidebarSearch } from './Search';

export default {
  component: Search,
  title: 'UI/Sidebar/Search',
  decorators: [
    (storyFn: any) => (
      <div style={{ width: '240px', margin: '1rem', padding: '1rem', background: 'white' }}>
        {storyFn()}
      </div>
    ),
  ],
};

const actions = makeActions('onChange');
const pureActions = { ...actions, ...makeActions('onSetFocussed') };

export const simple = () => <Search {...actions} />;

export const focussed = () => <PureSidebarSearch {...pureActions} />;

export const filledIn = () => <PureSidebarSearch defaultValue="Searchstring" {...pureActions} />;
