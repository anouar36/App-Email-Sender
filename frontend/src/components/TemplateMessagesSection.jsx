import React, { useState, useEffect } from 'react';
import { FileText, Eye, Copy, Edit, Trash2, Calendar, Terminal } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://app-email-sender.onrender.com' : 'http://localhost:5000');

const TemplateMessagesSection = ({ user }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/templates`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        setError('Failed to load templates');
      }
    } catch (error) {
      setError('Error loading templates');
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleCopyTemplate = (template) => {
    navigator.clipboard.writeText(template.body);
    console.log('> Template copied to clipboard');
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedTemplate(null);
  };

  if (loading) {
    return (
      <div className="space-y-4 font-mono">
        <div className="text-green-400 text-xs tracking-widest">
          [ LOADING TEMPLATES... ]
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-green-500/20 rounded"></div>
          <div className="h-4 bg-green-500/20 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 font-mono text-green-400">
        {error && (
          <div className="border border-red-500/40 bg-red-500/10 text-red-400 p-3 text-xs">
            [ ERROR ] {error}
          </div>
        )}

        {/* Templates List */}
        {templates.length === 0 ? (
          <div className="text-center py-12 border border-green-500/20 bg-black/40">
            <Terminal size={32} className="text-green-700 mx-auto mb-4" />
            <p className="text-green-700 text-sm tracking-widest">[ NO TEMPLATES FOUND ]</p>
            <p className="text-green-900 text-xs mt-2">
              Create your first template to see it here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-green-700 tracking-widest mb-4">
              [ {templates.length} TEMPLATE{templates.length !== 1 ? 'S' : ''} LOADED ]
            </div>
            
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-green-500/20 bg-black/60 p-4 hover:border-green-400/40 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3">
                      <FileText size={14} className="text-green-500" />
                      <h3 className="text-sm font-bold text-green-300 tracking-wider">
                        {template.name.toUpperCase()}
                      </h3>
                      <span className="text-xs px-2 py-1 border border-green-500/40 bg-green-500/10 text-green-500">
                        {template.type.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-green-400 font-mono">
                      SUBJECT: {template.subject}
                    </div>
                    
                    <div className="text-xs text-green-700 font-mono border-l-2 border-green-500/20 pl-2 max-h-20 overflow-hidden">
                      {template.body.length > 200 
                        ? `${template.body.substring(0, 200).replace(/<[^>]*>/g, '')}...` 
                        : template.body.replace(/<[^>]*>/g, '')
                      }
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-green-800">
                      <div className="flex items-center gap-1">
                        <Calendar size={10} />
                        CREATED: {new Date(template.created_at).toLocaleDateString()}
                      </div>
                      <div>
                        ID: #{template.id}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1 ml-4">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 border border-green-500/40 text-green-500 hover:bg-green-500/10 hover:border-green-400 transition-all text-xs"
                      title="Preview Template"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={() => handleCopyTemplate(template)}
                      className="p-2 border border-green-500/40 text-green-500 hover:bg-green-500/10 hover:border-green-400 transition-all text-xs"
                      title="Copy Template"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal - Cyberpunk Style */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 font-mono">
          <div className="bg-black border-2 border-green-500 max-w-6xl max-h-[90vh] w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="border-b border-green-500/30 p-4 flex items-center justify-between bg-green-500/5">
              <div>
                <h3 className="text-lg font-bold text-green-400 tracking-widest">
                  [ TEMPLATE_PREVIEW.exe ]
                </h3>
                <p className="text-xs text-green-700">{selectedTemplate.name.toUpperCase()}</p>
              </div>
              <button
                onClick={closePreview}
                className="px-3 py-1 border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-xs tracking-widest"
              >
                [X] CLOSE
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Raw Content */}
              <div className="w-1/2 p-4 overflow-y-auto border-r border-green-500/30">
                <h4 className="text-xs font-bold text-green-500 mb-3 tracking-widest border-b border-green-500/20 pb-1">
                  [ RAW_CONTENT ]
                </h4>
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
                  {selectedTemplate.body}
                </pre>
              </div>

              {/* Rendered Preview */}
              <div className="w-1/2 p-4 overflow-y-auto">
                <h4 className="text-xs font-bold text-green-500 mb-3 tracking-widest border-b border-green-500/20 pb-1">
                  [ RENDERED_PREVIEW ]
                </h4>
                <div className="border border-green-500/30 bg-white min-h-[400px]">
                  <iframe
                    srcDoc={selectedTemplate.body}
                    className="w-full h-full min-h-[400px]"
                    style={{ background: 'white' }}
                    title="Template Preview"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-green-500/30 p-4 flex justify-between bg-green-500/5">
              <div className="text-xs text-green-700 font-mono">
                TEMPLATE_ID: #{selectedTemplate.id} | SIZE: {selectedTemplate.body.length} chars
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyTemplate(selectedTemplate)}
                  className="px-4 py-2 border border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-400 transition-all text-xs tracking-widest"
                >
                  [ COPY ]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}    </>
  );
};

export default TemplateMessagesSection;
