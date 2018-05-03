import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import DraftEdit from'./draft.js';
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/braft.css'

class App extends Component {
  state={
    content: ''
  }
  setFiledCallBackTime=(htmlStr) => {
    console.log(htmlStr)
    this.setState({
      content: htmlStr
    })
  }
  handleChange = (content) => {
    console.log(content)
  }

  handleRawChange = (rawContent) => {
    console.log(rawContent)
  }
  render() {
    const editorProps = {
      height: 500,
      contentFormat: 'html',
      initialContent: '<p>Hello World!</p>',
      media: {
        allowPasteImage: true, // 是否允许直接粘贴剪贴板图片（例如QQ截图等）到编辑器
        image: true, // 开启图片插入功能
      },
      onChange: this.handleChange,
      onRawChange: this.handleRawChange
    }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <div style={{margin: '30px', border: '1px solid #ccc'}}>
          {/* <BraftEditor {...editorProps}/> */}
          <DraftEdit data={this.state.content} setFiledCallBack={this.setFiledCallBackTime} />
        </div>
        
      </div>
    );
  }
}

export default App;
