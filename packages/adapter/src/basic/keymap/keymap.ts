import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  joinBackward,
  joinDown,
  joinUp,
  lift,
  liftEmptyBlock,
  newlineInCode,
  selectNodeBackward,
  selectParentNode,
} from 'prosemirror-commands';
import { redo } from 'prosemirror-history';
import { keydownHandler } from 'prosemirror-keymap';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorProps, EditorView } from 'prosemirror-view';

import { TKeymapHandler } from '../..';
import { SylApi } from '../../api';
import { filterData, groupData, toArray, Types } from '../../libs';
import { CtrlPlugin } from '../ctrl-plugin';
import {
  clearFormatAtHead,
  deleteSelection,
  deleteZeroChar,
  insertBreak,
  selectBefore,
  splitBlockKeepMarks,
  undo,
} from './behavior';

type TNativeKeymapHandler = (state: EditorState, dispatch: EditorView['dispatch'], view: EditorView) => boolean;
type TNativeKeymap = Types.StringMap<TNativeKeymapHandler>;
type TSylKeymap = Types.StringMap<TKeymapHandler>;

const BASIC_KEYMAP_KEY = new PluginKey('basicKeymap');
const DEFAULT_KEYMAP_KEY = new PluginKey('defaultKeymap');
const CUSTOM_KEYMAP_KEY = new PluginKey('customKeymap');

// to prevent override basemap's basic map
const backspace = chainCommands(
  deleteSelection,
  selectBefore,
  joinBackward,
  selectNodeBackward,
  clearFormatAtHead,
  deleteZeroChar,
);

const enter = chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlockKeepMarks);

const basicKeymapPlugin = new Plugin({
  key: BASIC_KEYMAP_KEY,
  props: {
    handleKeyDown: keydownHandler({
      Enter: enter,
      'Mod-z': undo,
      'Mod-y': redo,
      'Shift-Mod-z': redo,
      Backspace: backspace,
      'Alt-ArrowUp': joinUp,
      'Alt-ArrowDown': joinDown,
      'Mod-Bracketleft': lift,
      Escape: selectParentNode,
      'Shift-Enter': insertBreak,
    }),
  },
});

const defaultKeymapPlugin = new Plugin({
  key: DEFAULT_KEYMAP_KEY,
  props: {
    handleKeyDown: keydownHandler(baseKeymap),
  },
});

const chainSylKeymap = (adapter: SylApi, ...handlers: TKeymapHandler[]): TNativeKeymapHandler => (...args) =>
  handlers.some(handler => handler(adapter, ...args));

const composeKeymap = (adapter: SylApi, keyMaps: Types.StringMap<Array<TKeymapHandler>>) =>
  Object.keys(keyMaps).reduce((res, key) => {
    res[key] = chainSylKeymap(adapter, ...keyMaps[key]);
    return res;
  }, {} as TNativeKeymap);

class KeymapCtrl {
  public adapter: SylApi;
  public props: EditorProps = {};
  private keyMapConfig: Types.StringMap<Array<TKeymapHandler>> = {};
  public spec = {
    props: this.props,
  };

  constructor(adapter: SylApi, configs?: Array<TSylKeymap>) {
    this.adapter = adapter;
    if (configs) this.register(configs);
  }

  private handleProps = () => {
    this.props.handleKeyDown = keydownHandler(composeKeymap(this.adapter, this.keyMapConfig));
  };

  register(registerConfigs: Array<TSylKeymap> | TSylKeymap, prioritized = false) {
    toArray(registerConfigs).forEach(keymap => {
      Object.keys(keymap).forEach(key => {
        groupData(this.keyMapConfig, key, keymap[key], prioritized);
      });
    });
    this.handleProps();
  }
  unregister(registerConfigs: Array<TSylKeymap> | TSylKeymap) {
    toArray(registerConfigs).forEach(keymap => {
      Object.keys(keymap).forEach(key => {
        filterData(this.keyMapConfig, key, keymap[key]);
      });
    });
    this.handleProps();
  }
}

const createCustomKeymapPlugins = (adapter: SylApi, customKeyMaps?: Array<TSylKeymap>) => {
  const ctrl = new KeymapCtrl(adapter, customKeyMaps);
  return new CtrlPlugin(ctrl.spec, ctrl);
};

export {
  BASIC_KEYMAP_KEY,
  basicKeymapPlugin,
  composeKeymap,
  createCustomKeymapPlugins,
  CUSTOM_KEYMAP_KEY,
  DEFAULT_KEYMAP_KEY,
  defaultKeymapPlugin,
  TSylKeymap,
};
