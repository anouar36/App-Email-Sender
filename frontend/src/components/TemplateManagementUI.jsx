import { Plus, Edit2, Copy, Trash2, FileText, Check } from 'lucide-react';

const TemplateManagementUI = ({
  customTemplates,
  TEMPLATES,
  handleTemplatePreview,
  openTemplateModal,
  handleDeleteTemplate,
  handleDuplicateTemplate,
  applyCustomTemplate,
  getTemplateVisual
}) => {
  return (
    <div className="border border-terminal-border bg-terminal-bg/80 backdrop-blur-sm p-6 relative overflow-hidden min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-terminal-border pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-terminal-accent flex items-center justify-center bg-terminal-accent/10">
            <FileText size={24} className="text-terminal-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-widest text-terminal-text">TEMPLATE_MANAGER</h2>
            <div className="text-xs text-terminal-dim font-mono mt-1">// CREATE_CUSTOM_EMAIL_TEMPLATES</div>
          </div>
        </div>
        <button
          onClick={() => openTemplateModal()}
          className="flex items-center gap-2 px-4 py-2 bg-terminal-accent/10 border border-terminal-accent text-terminal-accent text-xs uppercase tracking-widest hover:bg-terminal-accent hover:text-terminal-bg transition-all"
        >
          <Plus size={14} />
          NEW_TEMPLATE
        </button>
      </div>

      {/* Custom Templates Section */}
      {customTemplates.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm text-terminal-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            {'>'} YOUR_CUSTOM_TEMPLATES ({customTemplates.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customTemplates.map((template) => (
              <div
                key={template.id}
                className="border border-terminal-border/50 bg-terminal-darker p-4 hover:border-terminal-accent transition-all group relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-terminal-text truncate">
                      {template.name}
                    </h4>
                    <p className="text-[10px] text-terminal-dim truncate mt-1">
                      {template.subject}
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-terminal-dim font-mono mt-3 mb-4 line-clamp-3">
                  {template.body.substring(0, 100)}...
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => applyCustomTemplate(template)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-terminal-accent/10 border border-terminal-accent/30 text-terminal-accent text-[10px] hover:bg-terminal-accent hover:text-terminal-bg transition-all"
                    title="Apply Template"
                  >
                    <Check size={10} />
                    USE
                  </button>
                  <button
                    onClick={() => openTemplateModal(template)}
                    className="px-2 py-1.5 border border-terminal-border text-terminal-dim text-[10px] hover:border-terminal-text hover:text-terminal-text transition-all"
                    title="Edit"
                  >
                    <Edit2 size={10} />
                  </button>
                  <button
                    onClick={() => handleDuplicateTemplate(template.id)}
                    className="px-2 py-1.5 border border-terminal-border text-terminal-dim text-[10px] hover:border-terminal-text hover:text-terminal-text transition-all"
                    title="Duplicate"
                  >
                    <Copy size={10} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    className="px-2 py-1.5 border border-red-900/30 text-red-500/70 text-[10px] hover:border-red-500 hover:text-red-500 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>

                <div className="text-[8px] text-terminal-dim mt-2 text-right">
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Templates Section */}
      <div>
        <h3 className="text-sm text-terminal-dim uppercase tracking-widest mb-4 flex items-center gap-2">
          {'>'} DEFAULT_TEMPLATES
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(TEMPLATES)
            .filter(([key]) => key !== 'custom')
            .map(([key, temp]) => (
              <div
                key={key}
                className="group border border-terminal-border/50 bg-terminal-bg/50 hover:border-terminal-accent transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
                onClick={() => handleTemplatePreview(key)}
              >
                {/* Image Preview Container */}
                <div className="relative w-full h-32 overflow-hidden border-b border-terminal-border/30">
                  {getTemplateVisual(temp.type)}
                  <div className="absolute inset-0 bg-terminal-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <FileText className="w-8 h-8 text-terminal-accent drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-xs font-bold text-terminal-text uppercase tracking-widest mb-2">
                    {key.replace(/_/g, '_')}
                  </h3>
                  <p className="text-[10px] text-terminal-dim line-clamp-2 flex-1">
                    {temp.subject}
                  </p>
                  <div className="mt-3 pt-3 border-t border-terminal-border/30">
                    <span className="text-[8px] text-terminal-accent uppercase tracking-wider">
                      CLICK_TO_PREVIEW
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Empty State */}
      {customTemplates.length === 0 && (
        <div className="text-center py-8 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-terminal-bg border border-terminal-border/30 mb-4">
            <FileText size={32} className="text-terminal-dim" />
          </div>
          <p className="text-sm text-terminal-dim">NO_CUSTOM_TEMPLATES_YET</p>
          <p className="text-xs text-terminal-dim/50 mt-2">
            Click "NEW_TEMPLATE" to create your first custom template
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateManagementUI;
