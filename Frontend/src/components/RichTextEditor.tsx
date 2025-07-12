
import { useState, useRef } from 'react';
import { Bold, Italic, Strikethrough, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Smile } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emojis = ['😀', '😂', '😊', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💡', '✅', '❌', '⚡', '🚀'];

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
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
    document.execCommand('insertText', false, emoji);
    setShowEmojiPicker(false);
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
          onClick={() => executeCommand('insertOrderedList')}
          className="p-2 hover:bg-[#865A7B] hover:text-white rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
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
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#888888] rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-10">
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
        className="min-h-[200px] p-4 focus:outline-none"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default RichTextEditor;
