import React from 'react'
// import Api from 'utils/api'
import PropTypes from 'prop-types'
import {EditorState, convertToRaw, ContentState, Modifier, RichUtils, AtomicBlockUtils, ContentBlock, genKey, DefaultDraftBlockRenderMap} from 'draft-js'
// import {Icon} from 'antd'
import {Editor} from 'react-draft-wysiwyg'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import {getSelectedBlock} from 'draftjs-utils'
import Immutable from 'immutable'
import {stateFromHTML} from 'draft-js-import-html'

import './draft-wy.css'
import './draft.less'

const blockRenderMap = Immutable.Map({
    'atomic': {
        element: ''
      },
  });
  const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(blockRenderMap);
export default class extends React.Component {
    state = {
      editorState: '',
      analysisState: '',
      reInitial: true
    };

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
        // htmlStr = htmlStr + '<header-two>'
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
          blockRenderMap={extendedBlockRenderMap}
          toolbar={{
            options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'embedded', 'image', 'remove', 'history']
          }}
        />

      )
    }
}

class CustomOption extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    editorState: PropTypes.object
  };

  blocksTypes = [
    { label: 'Normal', style: 'unstyled' },
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'Code', style: 'code' },
    { label: 'div', style: 'unstyled' },
  ];

  addHr = (blockType) => {
    const { editorState, onChange } = this.props
    var contentStateWithEntity = editorState.getCurrentContent().createEntity('hr', 'IMMUTABLE', {})
    console.log(contentStateWithEntity)
    var entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    console.log(entityKey)
    const contentState = AtomicBlockUtils.insertAtomicBlock(
      editorState,
      entityKey,
      ' '
    )
    onChange(contentState)
  };

  toggleBold = () => {
    const { editorState, onChange } = this.props
    const newState = RichUtils.toggleInlineStyle(
      editorState,
      'color-red'
    )
    if (newState) {
      onChange(newState)
    }
  };

  render () {
    return (
      <div style={{display: 'flex'}}>
        <div onClick={this.toggleBold} title='格式刷'><div className='rdw-option-wrapper' type='printer' >1</div></div>
        <div onClick={this.addHr} title='分割线'><div className='rdw-option-wrapper' type='printer' >-</div></div>
        <div onClick={this.addHr} title='分割线'><div className='rdw-option-wrapper' type='printer' >3</div></div>
        <div onClick={this.addHr} title='格式刷'><div className='rdw-option-wrapper' type='printer' >4</div></div>
      </div>
    )
  }
}
