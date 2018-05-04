class MyCustomBlock extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
        <div className='MyCustomBlock'>
          {/* here, this.props.children contains a <section> container, as that was the matching element */}
          {this.props.children}
        </div>
      );
    }
  }
  
  const blockRenderMap = Immutable.Map({
    'MyCustomBlock': {
      // element is used during paste or html conversion to auto match your component;
      // it is also retained as part of this.props.children and not stripped out
      element: 'section',
      wrapper: MyCustomBlock,
    }
  });
  
  // keep support for other draft default block types and add our myCustomBlock type
  const extendedBlockRenderMap = Draft.DefaultDraftBlockRenderMap.merge(blockRenderMap);
  
  class RichEditor extends React.Component {
    ...
    render() {
      return (
        <Editor
          ...
          blockRenderMap={extendedBlockRenderMap}
        />
      );
    }
  }