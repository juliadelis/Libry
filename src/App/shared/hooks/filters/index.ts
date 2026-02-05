import { SelectionModel } from "../../helpers/selection-model";
import { useRxObservableEffect } from "../../hooks/rxjs-interop";
import { useRerender } from "../../hooks/useRerender";
import { useMemoRef } from "../../hooks/useStateRef";

import React, { useMemo } from "react";
import { debounceTime } from "rxjs";

export interface FilterMenuControlHolder<T> {
  selection: SelectionModel<T>;

  readonly renderCount: number;
}

export type MenuOptionItemLike<T> = {
  key: T;
  text: string;
};

export const useSimpleMenuOptionsWithSelectionModel = <T>(
  initialFactoryOrData:
    | MenuOptionItemLike<T>[]
    | (() => MenuOptionItemLike<T>[]),
  cfg?: {
    initialSelectionFactory?: (
      itemsData: MenuOptionItemLike<T>[],
    ) => SelectionModel<T> | T[];
    allOptionMode?: boolean;
    onlyOneChecked?: boolean;
  },
): (() => FilterMenuControlHolder<T>) => {
  const reRender = useRerender();

  let itemsFactory: () => MenuOptionItemLike<T>[];
  let depsForSelection: React.DependencyList;

  if (typeof initialFactoryOrData === "function") {
    itemsFactory = initialFactoryOrData;
    depsForSelection = [1];
  } else {
    itemsFactory = () => {
      return initialFactoryOrData ?? [];
    };
    depsForSelection = [initialFactoryOrData];
  }

  const itemsData = useMemo(itemsFactory, depsForSelection);

  const selection = useMemo(() => {
    const aux = cfg?.initialSelectionFactory?.(itemsData);
    if (aux instanceof SelectionModel) {
      return aux;
    }

    return new SelectionModel<T>(aux ?? []);
  }, []);

  useRxObservableEffect(
    () => {
      return selection.changes.pipe(debounceTime(0));
    },
    () => {
      reRender();
    },
    [selection],
  );

  const allOptionMode = !!cfg?.allOptionMode;
  const onlyOneChecked = !!cfg?.onlyOneChecked;

  return useMemoRef(() => {
    return {
      selection,

      get renderCount() {
        return reRender.renderCount;
      },
    };
  }, [itemsData, selection, allOptionMode, onlyOneChecked]);
};
