import React, {
  FunctionComponent,
  useMemo,
  useState,
  useCallback,
  Fragment,
  ComponentPropsWithoutRef,
} from 'react';
import { transparentize } from 'polished';

import { styled } from '@storybook/theming';
import { StoriesHash, State, useStorybookApi } from '@storybook/api';

import { ListItem } from './Tree/ListItem';
import { toFiltered, getMains } from './Tree/utils';
import { Tree } from './Tree/Tree';
import { Section } from './Section';
import { Loader } from './Loader';

type Refs = State['refs'];
type RefType = Refs[keyof Refs];
type BooleanSet = Record<string, boolean>;
type Item = StoriesHash[keyof StoriesHash];
type DataSet = Record<string, Item>;

const RootHeading = styled.div(({ theme }) => ({
  letterSpacing: '0.35em',
  textTransform: 'uppercase',
  fontWeight: theme.typography.weight.black,
  fontSize: theme.typography.size.s1 - 1,
  lineHeight: '24px',
  color: transparentize(0.5, theme.color.defaultText),
  margin: '0 20px',
}));
RootHeading.defaultProps = {
  className: 'sidebar-subheading',
};

const RefHead = styled.div(({ theme }) => ({
  padding: theme.layoutMargin,
  paddingLeft: theme.layoutMargin * 2,
}));

interface RefProps {
  storyId: string;
  filter: string;
  isHidden: boolean;
}

export const Ref: FunctionComponent<RefType & RefProps> = ({
  stories,
  id: key,
  title = key,
  storyId,
  filter,
  isHidden = false,
}) => {
  const { dataSet, expandedSet, length, others, roots, setExpanded, selectedSet } = useDataset(
    stories,
    filter,
    storyId
  );

  const Components = useMemo(() => {
    return {
      Head: (props: ComponentPropsWithoutRef<typeof ListItem>) => {
        const api = useStorybookApi();
        const { id, isComponent, childIds } = props;
        const onClick = useCallback(
          e => {
            e.preventDefault();
            if (!expandedSet[id] && isComponent && childIds && childIds.length) {
              api.selectStory(childIds[0]);
            }
            setExpanded(s => ({ ...s, [id]: !s[id] }));
          },
          [id, expandedSet[id]]
        );
        return <ListItem onClick={onClick} {...props} />;
      },
      Leaf: (props: ComponentPropsWithoutRef<typeof ListItem>) => {
        const api = useStorybookApi();
        const { id } = props;
        const onClick = useCallback(
          e => {
            e.preventDefault();
            api.selectStory(id);
            setExpanded(s => ({ ...s, [id]: !s[id] }));
          },
          [id]
        );
        return <ListItem onClick={onClick} {...props} />;
      },
      Branch: Tree,
      List: styled.div({}),
    };
  }, [selectedSet]);

  const isLoading = !length;

  if (isHidden) {
    return null;
  }

  const isMain = key === 'storybook_internal';

  return (
    <div>
      {isMain ? <RefHead>{title}</RefHead> : null}
      {isLoading ? (
        <Loader size={isMain ? 'multiple' : 'single'} />
      ) : (
        <Fragment>
          {others.length ? (
            <Section key="other">
              {others.map(({ id }) => (
                <Tree
                  key={id}
                  depth={0}
                  dataset={dataSet}
                  selected={selectedSet}
                  expanded={expandedSet}
                  root={id}
                  {...Components}
                />
              ))}
            </Section>
          ) : null}

          {roots.map(({ id, name, children }) => (
            <Section key={id}>
              <RootHeading>{name}</RootHeading>
              {children.map(child => (
                <Tree
                  key={child}
                  depth={0}
                  dataset={dataSet}
                  selected={selectedSet}
                  expanded={expandedSet}
                  root={child}
                  {...Components}
                />
              ))}
            </Section>
          ))}
        </Fragment>
      )}
    </div>
  );
};

const useDataset = (dataset: DataSet = {}, filter: string, storyId: string) => {
  const initial = useMemo(() => {
    return Object.keys(dataset).reduce(
      (acc, k) => ({
        filtered: { ...acc.filtered, [k]: true },
        unfiltered: { ...acc.unfiltered, [k]: false },
      }),
      { filtered: {} as BooleanSet, unfiltered: {} as BooleanSet }
    );
  }, [dataset]);

  const type: 'filtered' | 'unfiltered' = filter.length >= 2 ? 'filtered' : 'unfiltered';

  const expandedSets = {
    filtered: useState(initial.filtered),
    unfiltered: useState(initial.unfiltered),
  };

  const selectedSet = useMemo(() => {
    return Object.keys(dataset).reduce(
      (acc, k) => Object.assign(acc, { [k]: k === storyId }),
      {} as BooleanSet
    );
  }, [dataset, storyId]);

  const [state, setState] = expandedSets[type];

  const filteredSet = useMemo(() => (type === 'filtered' ? toFiltered(dataset, filter) : dataset), [
    dataset,
    filter,
  ]);

  const length = useMemo(() => Object.keys(filteredSet).length, [filteredSet]);

  const { roots, others } = useMemo(
    () =>
      getMains(filteredSet).reduce(
        (acc, item) => {
          const { isRoot } = item;
          return isRoot
            ? { ...acc, roots: [...acc.roots, item] }
            : { ...acc, others: [...acc.others, item] };
        },
        { roots: [] as Item[], others: [] as Item[] }
      ),
    [filteredSet]
  );

  return {
    roots,
    others,
    length,
    dataSet: filteredSet,
    selectedSet,
    expandedSet: state,
    setExpanded: setState,
  };
};
