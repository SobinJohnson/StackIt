
import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Smile } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const emojis = ['😀', '😂', '😊', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💡', '✅', '❌', '⚡', '🚀'];

  // Only set innerHTML on mount or when value changes from outside
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      editorRef.current.innerHTML = value;
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Save selection before executing command
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  // Restore selection after executing command
  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const executeCommand = (command: string, value?: string) => {
    const savedRange = saveSelection();
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, value);
    restoreSelection(savedRange);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertEmoji = (emoji: string) => {
    const savedRange = saveSelection();
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('insertText', false, emoji);
    setShowEmojiPicker(false);
    restoreSelection(savedRange);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const insertOrderedList = () => {
    const savedRange = saveSelection();
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
    const success = document.execCommand('insertOrderedList', false);
    if (!success) {
      document.execCommand('insertHTML', false, '<ol><li></li></ol>');
    }
    restoreSelection(savedRange);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertUnorderedList = () => {
    const savedRange = saveSelection();
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
    const success = document.execCommand('insertUnorderedList', false);
    if (!success) {
      document.execCommand('insertHTML', false, '<ul><li></li></ul>');
    }
    restoreSelection(savedRange);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleEditorClick = () => {
    if (editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus();
    }
  };

  return (
    <div className="border border-[#888888] rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-[#888888] flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('strikeThrough')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <div className="w-px bg-[#888888] my-1"></div>
        <button
          type="button"
          onClick={insertOrderedList}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertUnorderedList}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <div className="w-px bg-[#888888] my-1"></div>
        <button
          type="button"
          onClick={() => executeCommand('justifyLeft')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyCenter')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('justifyRight')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <div className="w-px bg-[#888888] my-1"></div>
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Insert Link"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Insert Image"
        >
          <Image className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
            title="Insert Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#888888] min-w-80 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="p-1 hover:bg-gray-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onClick={handleEditorClick}
        onFocus={handleEditorClick}
        className="min-h-[200px] p-4 focus:outline-none"
        style={{ 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default RichTextEditor;
