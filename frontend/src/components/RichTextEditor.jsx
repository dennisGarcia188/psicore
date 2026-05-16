import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const btnStyle = (isActive) => ({
    padding: '0.4rem',
    borderRadius: '4px',
    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', flexWrap: 'wrap' }}>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))} title="Negrito">
        <Bold size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))} title="Itálico">
        <Italic size={18} />
      </button>
      <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))} title="Título">
        <Heading2 size={18} />
      </button>
      <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))} title="Lista">
        <List size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))} title="Lista Numerada">
        <ListOrdered size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))} title="Citação">
        <Quote size={18} />
      </button>
      <div style={{ flex: 1 }} />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={{...btnStyle(false), opacity: editor.can().undo() ? 1 : 0.5}} title="Desfazer">
        <Undo size={18} />
      </button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={{...btnStyle(false), opacity: editor.can().redo() ? 1 : 0.5}} title="Refazer">
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ value, onChange, placeholder = 'Escreva aqui...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: 'min-height: 200px; max-height: 400px; overflow-y: auto; padding: 1rem; outline: none; color: var(--color-text-main); line-height: 1.6;'
      }
    }
  });

  // Atualiza conteúdo externo apenas se for um set forçado (ex: selecionou um template novo)
  // useEditor não é totalmente reativo à prop `content` nativamente após a montagem.
  if (editor && value !== editor.getHTML() && value !== undefined) {
      // Se a string passada for vazia, limpamos o editor, caso contrário, mantemos se for igual para não bugar o cursor
      if (value === '' && editor.getHTML() !== '<p></p>') {
          setTimeout(() => editor.commands.setContent(''), 0);
      }
  }

  return (
    <div style={{ 
      border: '1px solid var(--color-border)', 
      borderRadius: 'var(--radius-md)', 
      overflow: 'hidden',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
    }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
