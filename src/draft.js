import React from 'react'
// import Api from 'utils/api'
import PropTypes from 'prop-types'
import {EditorState, convertToRaw, ContentState, Modifier, RichUtils, convertFromRaw, ContentBlock, genKey, DefaultDraftBlockRenderMap} from 'draft-js'
// import {Icon} from 'antd'
import {Editor} from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import {getSelectedBlock} from 'draftjs-utils'
import Immutable from 'immutable'
import {stateFromHTML} from 'draft-js-import-html'
import './draft-wy.css'
import './draft.less'

class CustomBlockContent extends React.Component {
	render() {
  	return (
    	<div className="online">
        Custom block with <a href="http://www.google.com">link</a>
      </div>
    );
  }
}

const customBlockRenderMap = DefaultDraftBlockRenderMap.merge(Immutable.Map({
  'custom': {
    element: 'div',
  },
}));

export default class extends React.Component {
    state = {
      editorState: '',
      analysisState: '',
      reInitial: true
    };

    _getCustomBlockRenderer(block) {
      return block => {
        if (block.getType() === "custom") {
          return {
            component: () => (
              <div
                key={block.getKey()}
                className="custom"
                onMouseEnter={this._activateMouseInteraction}
                onMouseLeave={this._deactivateMouseInteraction}
              >
                <CustomBlockContent />
              </div>
            ),
            editable: false,
          };
        }
        
        return null;
      };
    }

    componentWillReceiveProps (nextProps, props) {
      if (nextProps.data && this.state.reInitial) {
        const contentBlock = htmlToDraft(nextProps.data)
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
          const editorState = EditorState.createWithContent(contentState)
          this.setState({
            editorState,
            reInitial: false
          })
        }
      }
    }

    // 富文本
    onEditorStateChange = (editorState) => {
      this.setState({
        editorState
      }, () => {
        let htmlStr = draftToHtml(convertToRaw(editorState.getCurrentContent()))
        htmlStr = htmlStr.length > 8 ? htmlStr : ''
        console.log(htmlStr)
        htmlStr = htmlStr.replace(/<p><\/p>/g, '<p>&nbsp;</p>')
        this.props.setFiledCallBack(htmlStr)
      })
    };

    handlePastedText = (text, html, editorState, onChange) => {
      const selectedBlock = getSelectedBlock(editorState)
      if (selectedBlock && selectedBlock.type === 'code') {
        const contentState = Modifier.replaceText(
          editorState.getCurrentContent(),
          editorState.getSelection(),
          text,
          editorState.getCurrentInlineStyle()
        )
        onChange(EditorState.push(editorState, contentState, 'insert-characters'))
        return true
      } else if (html) {
        const contentBlock = htmlToDraft(html)
        let blockMap = new Immutable.OrderedMap({})
        contentBlock.contentBlocks.forEach(block => {
          blockMap = blockMap.set(block.get('key'), block)
        })
        let contentState = editorState.getCurrentContent()
        contentBlock.entityMap.forEach((value, key) => {
          contentState = contentState.mergeEntityData(key, value)
        })
        contentState = Modifier.replaceWithFragment(
          contentState,
          editorState.getSelection(),
          blockMap
        )
        onChange(EditorState.push(editorState, contentState, 'insert-characters'))
        return true
      }
      return false
    }

    render () {
    //   const {uploadData} = this.props
      return (

        <Editor
          editorState={this.state.editorState}
          wrapperClassName='news-wrapper'
          editorClassName='news-editor'
          localization={{locale: 'zh'}}
          handlePastedText={this.handlePastedText}
          onEditorStateChange={this.onEditorStateChange}
          toolbarCustomButtons={[<CustomOption />]}
          blockRenderMap={customBlockRenderMap}
          blockRendererFn={this._getCustomBlockRenderer()}
          customStyleMap={styleMap}
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'image', 'remove', 'history'],
            oneline: {className: 'editor-opacity'},
          }}
        />

      )
    }
}

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: '0 2em',
  },
  HR: {
    backgroundColor: '#ddd',
    height: '2px',
    width: '100%',
    margin: '5px 0',
  },
  LS: {
    letterSpacing: '20px'
  },
  LH: {
    lineHeight: '50px'
  },
  PADDING: {
    padding: '0 2em',
    wordBreak: 'break-all',
    display: 'inline-block'
  },
};

class CustomOption extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    editorState: PropTypes.object
  };

  addHr = (blockType) => {
    const { editorState, onChange } = this.props
  
    // var contentStateWithEntity = editorState.getCurrentContent().createEntity('code-block', 'IMMUTABLE', {})
    // console.log(contentStateWithEntity)
    // var entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    // console.log(entityKey)
    // const contentState = AtomicBlockUtils.insertAtomicBlock(
    //   editorState,
    //   entityKey,
    //   ' '
    // )
    // onChange(editorState)

    let editorState1 = EditorState.createWithContent(convertFromRaw({
    	entityMap: {},
    	blocks: [
        // {
        //   type: "header-one",
        //   text: "Hello there"
        // },
        // {
        //   type: "unstyled",
        //   text: "Try:\nA) Clicking on the link\nB) Dragging the link from custom block to text"
        // },
        {
          type: "custom",
          text: ""
        }
      ],
  	}));
    // this.state = {
    //   editorState: editorState1,
    //   mouseIsOverCustomBlock: false,
    // };
    onChange(editorState1)
  };

  toggleBold = () => {
    const { editorState, onChange } = this.props
    const newState = RichUtils.toggleInlineStyle(
      editorState,
      'HR'
    )
    if (newState) {
      onChange(newState)
    }
  };

  toggleLS = () => {
    const { editorState, onChange } = this.props
    const newState = RichUtils.toggleInlineStyle(
      editorState,
      'LS'
    )
    if (newState) {
      onChange(newState)
    }
  };

  toggleLH = () => {
    const { editorState, onChange } = this.props
    const newState = RichUtils.toggleInlineStyle(
      editorState,
      'LH'
    )
    if (newState) {
      onChange(newState)
    }
  };

  togglePADDING = () => {
    const { editorState, onChange } = this.props
    const newState = RichUtils.toggleInlineStyle(
      editorState,
      'PADDING'
    )
    if (newState) {
      onChange(newState)
    }
  };

  render () {
    return (
      <div style={{display: 'flex'}}>
        <div title='格式刷'><div className='rdw-option-wrapper' type='printer' >
        <select>
          <option value ="1">1</option>
          <option value ="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        </div></div>
        <div onClick={this.addHr} title='分割线'><div className='rdw-option-wrapper' type='printer' >-</div></div>
        <div onClick={this.toggleBold} title='分割线'><div className='rdw-option-wrapper' type='printer' >3</div></div>
        <div onClick={this.togglePADDING} title='字距'><div className='rdw-option-wrapper' type='printer' >PADDING</div></div>
        <div onClick={this.toggleLS} title='字距'><div className='rdw-option-wrapper' type='printer' >LS</div></div>
        <div onClick={this.toggleLH} title='行高'><div className='rdw-option-wrapper' type='printer' >LH</div></div>
      </div>
    )
  }
}
