import { X, Plus, Edit2, Copy, Trash2 } from 'lucide-react';

const TemplateManagementModal = ({ 
  showModal, 
  closeModal, 
  templateForm, 
  setTemplateForm,
  handleSave,
  isEditing 
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-terminal-bg border-2 border-terminal-accent max-w-3xl w-full max-h-[90vh] overflow-y-auto terminal-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-terminal-border bg-terminal-darker">
          <h2 className="text-lg font-bold tracking-widest text-terminal-accent uppercase">
            {isEditing ? '[EDIT_TEMPLATE]' : '[NEW_TEMPLATE]'}
          </h2>
          <button 
            onClick={closeModal}
            className="text-terminal-dim hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-xs text-terminal-dim uppercase tracking-wider mb-2">
              {'>'} TEMPLATE_NAME
            </label>
            <input
              type="text"
              value={templateForm.name}
              onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border px-4 py-3 text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none transition-all"
              placeholder="My Custom Template..."
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs text-terminal-dim uppercase tracking-wider mb-2">
              {'>'} EMAIL_SUBJECT
            </label>
            <input
              type="text"
              value={templateForm.subject}
              onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              className="w-full bg-terminal-bg border border-terminal-border px-4 py-3 text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none transition-all"
              placeholder="Enter subject line..."
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs text-terminal-dim uppercase tracking-wider mb-2">
              {'>'} EMAIL_BODY
            </label>
            <textarea
              value={templateForm.body}
              onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
              rows={12}
              className="w-full bg-terminal-bg border border-terminal-border px-4 py-3 text-terminal-text font-mono text-sm focus:border-terminal-accent focus:outline-none transition-all resize-none terminal-scrollbar"
              placeholder="// Type your email content here..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-terminal-border">
            <button
              onClick={closeModal}
              className="px-6 py-2 border border-terminal-dim text-terminal-dim hover:border-terminal-text hover:text-terminal-text transition-all text-xs uppercase tracking-widest"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-terminal-accent text-terminal-bg font-bold hover:shadow-[0_0_20px_rgba(0,255,65,0.4)] transition-all text-xs uppercase tracking-widest"
            >
              {isEditing ? 'UPDATE' : 'CREATE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateManagementModal;
