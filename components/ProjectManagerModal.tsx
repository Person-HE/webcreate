import React, { useState, useRef } from 'react';
import {
  X, FolderOpen, Plus, Trash2, Edit3, Copy, Download, Upload,
  Check, Clock, MoreHorizontal, FolderPlus,
} from 'lucide-react';
import { useStore } from '../store';
import { Project } from '../types';

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({ isOpen, onClose }) => {
  const {
    projects,
    currentProjectId,
    addProject,
    switchProject,
    deleteProject,
    renameProject,
    duplicateProject,
    exportProject,
    importProject,
    saveProject,
  } = useStore();

  const [newProjectName, setNewProjectName] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleCreate = () => {
    const name = newProjectName.trim() || `项目 ${projects.length + 1}`;
    addProject(name);
    setNewProjectName('');
    setShowNewForm(false);
  };

  const handleSwitch = (projectId: string) => {
    saveProject();
    switchProject(projectId);
    onClose();
  };

  const handleRename = (projectId: string) => {
    if (editingName.trim()) {
      renameProject(projectId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    setDeleteConfirmId(null);
    setMenuOpenId(null);
  };

  const handleExport = (projectId: string) => {
    const jsonStr = exportProject(projectId);
    if (!jsonStr) return;

    const project = projects.find(p => p.id === projectId);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'project'}.webcreate.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpenId(null);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = importProject(content);
        if (!success) {
          alert('导入失败：文件格式不正确');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} 天前`;

    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const sortedProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-2xl w-[580px] max-h-[80vh] shadow-2xl border border-gray-800 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.webcreate.json"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <FolderOpen size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">项目管理</h2>
              <p className="text-xs text-gray-400">{projects.length} 个项目</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Actions bar */}
        <div className="px-5 py-3 border-b border-gray-800 flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            新建项目
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm transition-colors border border-gray-700"
          >
            <Upload size={16} />
            导入
          </button>
        </div>

        {/* New project form */}
        {showNewForm && (
          <div className="px-5 py-3 border-b border-gray-800 bg-gray-800/30 shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                placeholder="项目名称"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setShowNewForm(false);
                }}
                autoFocus
              />
              <button
                onClick={handleCreate}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm transition-colors"
              >
                创建
              </button>
              <button
                onClick={() => { setShowNewForm(false); setNewProjectName(''); }}
                className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Project list */}
        <div className="flex-1 overflow-y-auto p-3">
          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <FolderPlus size={48} className="mb-4 opacity-30" />
              <p className="text-sm mb-1">还没有项目</p>
              <p className="text-xs text-gray-600">点击上方"新建项目"开始创作</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedProjects.map(project => {
                const isCurrent = project.id === currentProjectId;
                const isEditing = editingId === project.id;
                const isDeleteConfirm = deleteConfirmId === project.id;

                return (
                  <div
                    key={project.id}
                    className={`group rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-transparent hover:border-gray-700 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center px-3 py-3">
                      {/* Project icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mr-3 ${
                        isCurrent ? 'bg-blue-500/20' : 'bg-gray-800'
                      }`}>
                        <FolderOpen size={18} className={isCurrent ? 'text-blue-400' : 'text-gray-500'} />
                      </div>

                      {/* Project info */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={e => setEditingName(e.target.value)}
                              className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleRename(project.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                            />
                            <button
                              onClick={() => handleRename(project.id)}
                              className="p-1 rounded hover:bg-gray-700 text-green-400"
                            >
                              <Check size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium truncate ${isCurrent ? 'text-blue-300' : 'text-gray-200'}`}>
                                {project.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 shrink-0">
                                  当前
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Clock size={10} className="text-gray-600" />
                              <span className="text-xs text-gray-500">{formatDate(project.updatedAt)}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      {!isEditing && (
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {!isCurrent && (
                            <button
                              onClick={() => handleSwitch(project.id)}
                              className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
                            >
                              打开
                            </button>
                          )}

                          {/* More menu */}
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === project.id ? null : project.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {menuOpenId === project.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                                <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-20 min-w-[160px] py-1">
                                  <button
                                    onClick={() => {
                                      setEditingId(project.id);
                                      setEditingName(project.name);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                  >
                                    <Edit3 size={14} /> 重命名
                                  </button>
                                  <button
                                    onClick={() => {
                                      duplicateProject(project.id);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                  >
                                    <Copy size={14} /> 复制项目
                                  </button>
                                  <button
                                    onClick={() => handleExport(project.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                                  >
                                    <Download size={14} /> 导出
                                  </button>
                                  <div className="border-t border-gray-700 my-1" />
                                  <button
                                    onClick={() => {
                                      setDeleteConfirmId(project.id);
                                      setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                  >
                                    <Trash2 size={14} /> 删除
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delete confirmation */}
                    {isDeleteConfirm && (
                      <div className="px-3 pb-3 flex items-center gap-2">
                        <span className="text-xs text-red-400 flex-1">确定删除此项目？此操作不可撤销。</span>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                          删除
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManagerModal;
