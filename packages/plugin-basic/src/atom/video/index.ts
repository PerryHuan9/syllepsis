import { BlockAtom, SylApi, SylController, SylPlugin } from '@syllepsis/adapter';
import { DOMOutputSpecArray, Node } from 'prosemirror-model';

import {
  addAttrsByConfig,
  createFileInput,
  getFromDOMByConfig,
  IUserAttrsConfig,
  setDOMAttrByConfig,
} from '../../utils';

interface IVideoProps {
  uploader: (file: File, editor: SylApi) => Promise<{ src: string; width?: number; height?: number }>;
  accept?: string;
  addAttributes?: IUserAttrsConfig;
  isInline?: boolean;
}

interface IVideoAttrs {
  src: string;
  width: string | number;
  height: string | number;
}

const NAME = 'video';

class VideoController extends SylController<IVideoProps> {
  public fileInput: HTMLInputElement;
  public toolbar = {
    icon: '',
    handler: () => this.fileInput.click(),
  };

  public uploadVideo: IVideoProps['uploader'] = async () =>
    Promise.reject('please provide uploader in controllerProps for video');

  constructor(editor: SylApi, props: IVideoProps) {
    super(editor, props);
    if (props.uploader) this.uploadVideo = props.uploader;
    this.fileInput = createFileInput({
      multiple: false,
      accept: props.accept || 'video/*',
      onChange: this.onChange,
      getContainer: () => editor.root,
    });
  }

  public onChange = async (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target.files) return;
    const index = this.editor.getSelection().index;
    const attrs = await this.uploadVideo(target.files[0], this.editor);
    if (!attrs) return;
    this.editor.insertCard(NAME, attrs as any, index);
  };

  public editorWillUnmount = () => {
    this.editor.root.removeChild(this.fileInput);
  };
}

class Video extends BlockAtom<IVideoAttrs> {
  public props: IVideoProps;
  constructor(editor: SylApi, props: IVideoProps) {
    super(editor, props);
    this.props = props;
    addAttrsByConfig(props.addAttributes, this);
    if (props.isInline) {
      this.inline = true;
      this.group = 'inline';
    }
  }

  public name = NAME;

  public attrs = {
    src: {
      default: '',
    },
    width: {
      default: 375,
    },
    height: {
      default: '',
    },
  };
  public parseDOM = [
    {
      tag: 'p',
      getAttrs: (dom: HTMLParagraphElement) => {
        if (this.inline) return false;
        const video = dom.querySelector('video');
        if (video && dom.parentElement) {
          dom.nextElementSibling
            ? dom.parentElement.insertBefore(video, dom.nextElementSibling)
            : dom.parentElement.appendChild(video);
        }
        return false;
      },
    },
    {
      tag: 'video',
      getAttrs: (dom: HTMLVideoElement) => {
        let src = dom.src;
        if (!src) {
          const source = dom.querySelector('source');
          if (!source) return false;
          src = source.src;
        }
        if (!src) return false;
        const formattedAttrs = {
          src,
          width: dom.width || undefined,
          height: dom.height || undefined,
        };
        getFromDOMByConfig(this.props.addAttributes, dom, formattedAttrs);
        return formattedAttrs;
      },
    },
  ];
  public toDOM = (node: Node) => {
    const attrs = { ...node.attrs };
    setDOMAttrByConfig(this.props.addAttributes, node, attrs);
    const renderSpec = ['video', { controls: 'true', ...attrs }] as DOMOutputSpecArray;
    if (this.inline) return renderSpec;
    return ['div', { class: 'syl-video-wrapper', align: 'center' }, renderSpec] as DOMOutputSpecArray;
  };
}

class VideoPlugin extends SylPlugin<IVideoProps> {
  public name = NAME;
  public Controller = VideoController;
  public Schema = Video;
}

export { IVideoAttrs, IVideoProps, Video, VideoController, VideoPlugin };
