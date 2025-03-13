import React, { useState } from 'react';
import { FileList } from './FileList';
import { RuleSettings } from './RuleSettings';
import { SavedRules } from './SavedRules';
import { md5 } from "js-md5";
import { open } from "@tauri-apps/api/dialog";

export interface FileItem {
    originalName: string;
    newName: string;
    status: 'pending' | 'success' | 'error';
}

export const RenamePanel: React.FC = () => {
    const [selectedFileType, setSelectedFileType] = useState<string>('file');
    const [files, setFiles] = useState<FormatedItem[]>([]);
    const [showRuleSettings, setShowRuleSettings] = useState(false);
    const [selectedRule, setSelectedRule] = useState<string>('');
    const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

    const handleClear = () => {
        setFiles([]);
    };

    const handleAddNewRule = () => {
        setEditingRuleId(null);
        setShowRuleSettings(true);
    };

    const handleEditRule = (ruleId: string) => {
        setEditingRuleId(ruleId);
        setShowRuleSettings(true);
    };

    const handleRuleSaved = (ruleName?: string) => {
        setShowRuleSettings(false);
        setEditingRuleId(null);
        if (ruleName) {
            setSelectedRule(ruleName);
        }
    };

    return (
        <div className="flex h-screen p-4 bg-gray-50">
            {/* 左侧规则设置 */}
            <div className="w-1/3 bg-white rounded-lg border p-4 mr-4">
                {showRuleSettings ? (
                    <RuleSettings onSave={handleRuleSaved} editingRuleId={editingRuleId} />
                ) : (
                    <SavedRules
                        selectedRule={selectedRule}
                        onSelectRule={setSelectedRule}
                        onAddNewRule={handleAddNewRule}
                        onEditRule={handleEditRule}
                    />
                )}
            </div>

            {/* 右侧内容区域 */}
            <div className=" flex-1 flex flex-col">
                {/* 右侧上部：文件选择区域 */}
                <div className="bg-white rounded-lg border p-4 mb-4">
                    {/* 文件类型选择 */}
                    <div className="flex gap-4 mb-4 hidden">
                        <div
                            className={`flex-1 p-4 rounded-lg cursor-pointer transition-colors ${selectedFileType === 'folder' ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => setSelectedFileType('folder')}
                        >
                            <h3 className="text-center">文件夹模式</h3>
                        </div>
                        <div
                            className={`flex-1 p-4 rounded-lg cursor-pointer transition-colors ${selectedFileType === 'file' ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                            onClick={() => setSelectedFileType('file')}
                        >
                            <h3 className="text-center">文件模式</h3>
                        </div>
                    </div>

                    {/* 文件选择区域 */}
                    {selectedFileType === 'folder' ? (
                        <div
                            className="w-full p-2 border rounded cursor-pointer hover:bg-gray-50"
                            onClick={async () => {
                                try {
                                    // 打开文件夹选择对话框
                                } catch (err) {
                                    console.error('选择文件夹失败:', err);
                                }
                            }}
                        >
                            点击选择文件夹
                        </div>
                    ) : (
                        <div
                            className="w-full h-32 p-4 border-2 border-dashed rounded-lg cursor-pointer 
                                flex items-center justify-center
                                hover:bg-gray-50 transition-colors
                                relative"
                            onClick={async () => {
                                try {
                                    const selected = await open({
                                        directory: false,
                                        multiple: true,
                                    });
                                    const keys = files.map(file => file.key)
                                    let newFiles: ListItem[] = [];
                                    (selected as string[]).forEach((handle: string) => {
                                        let fileName = handle.split("\\").pop();
                                        const match = fileName?.match(/\.[^/.]+$/);
                                        let ext = match ? match[0] : "";
                                        let key = md5(handle);
                                        if (!keys.includes(key)) {
                                            newFiles.push({
                                                key: md5(handle),
                                                path: handle,
                                                file: fileName,
                                                ext
                                            })
                                        }
                                    });

                                    setFiles(prev => [...prev, ...newFiles]);
                                } catch (err) {
                                    console.error('选择文件失败:', err);
                                }
                            }
                            }
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
                            }}
                            onDragLeave={(e) => {
                                e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                            }}
                            onDrop={async (e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
                                // const newFiles = Array.from(e.dataTransfer.files).map(file => ({
                                //     originalName: file.name,
                                //     newName: file.name,
                                //     status: 'pending' as const
                                // }));
                                // setFiles(prev => [...prev, ...newFiles]);
                            }}
                        >
                            <div className="text-center">
                                <div className="text-gray-400 mb-2">
                                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div className="text-gray-600">点击选择或拖拽文件到此处</div>
                                <div className="text-gray-400 text-sm mt-1">支持多个文件</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 右侧下部：文件列表 */}
                <div className="flex-1 overflow-hidden bg-white rounded-lg border p-4">
                    <FileList files={files} onClear={handleClear} selectedRuleId={selectedRule} clearRuleId={() => setSelectedRule('')} updateFiles={setFiles} />
                </div>
            </div>
        </div>
    );
};