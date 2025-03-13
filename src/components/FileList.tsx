import React, { useEffect, useState } from 'react';
import useRuleStore from '@/store/rule_store';
import { invoke } from "@tauri-apps/api";
import dayjs from "dayjs";
import { split, upperCaseFirst } from "@/lib/rename_utils";
import TooltipWrap from './tooltip-wrap';
import { md5 } from 'js-md5';
import { Button } from './ui/button';

interface FileListProps {
    files: FormatedItem[];
    onClear: () => void;
    selectedRuleId?: string | null,
    clearRuleId: () => void;
    updateFiles: (files: FormatedItem[]) => void;
}

export const FileList: React.FC<FileListProps> = ({ files, onClear, selectedRuleId, clearRuleId, updateFiles }) => {
    const [selectedFiles, setSelectedFiles] = useState<Set<FormatedItem>>(new Set());
    const [rule, setRule] = useState<Rule | null>(null);
    const [formatedList, setFormatedList] = useState<FormatedItem[]>([]);
    const { rulesList } = useRuleStore();

    useEffect(() => {
        if (selectedRuleId) {
            const rule = rulesList.find((rule) => rule.id === selectedRuleId);
            setRule(rule || null);
        } else {
            setRule(null);
        }
    }, [selectedRuleId, rulesList]);

    // 当rule和selectedFiles变化时，根据rule规则首先对selectedFiles的文件名进行处理，并将处理后的文件更新到一个新的数组中
    useEffect(() => {
        async function init() {
            let newList = await formatList();
            setSelectedFiles(new Set(newList));
        }
        init()
    }, [files, rule]);

    const formatList = async () => {
        let join_str = " ";

        let _format = [...rule?.rules || []];
        let func = []; // 单词相关处理
        let before_format = []; // 处理文本移除、替换等
        let after_join = []; // 处理文本添加、时间添加等

        while (_format.length) {
            let item = _format.shift();
            if (item) {
                switch (item.type) {
                    case "Join":
                        join_str = item.value || "";
                        break;
                    case "FormatWord":
                        if (item.value === "CamelCase") {
                            func.push((word: string, index: number) => {
                                if (index === 0) {
                                    return word;
                                } else {
                                    return upperCaseFirst(word);
                                }
                            });
                        } else if (item.value === "PascalCase") {
                            func.push((word: string, _index: number) => upperCaseFirst(word));
                        } else if (item.value === "UpperCase") {
                            func.push((word: string, _index: number) => word.toUpperCase());
                        }
                        break;
                    case "Remove":
                    case "Replace":
                        before_format.push((filename: string) => {
                            filename = filename.replace(
                                item.value || "",
                                item.replaced || ""
                            );
                            return filename;
                        });
                        break;
                    case "RemoveReg":
                    case "ReplaceReg":
                        before_format.push((filename: string) => {
                            filename = filename.replace(
                                new RegExp(item.value || "", item.regFlags),
                                item.replaced || ""
                            );
                            return filename;
                        });
                        break;
                    case "Append":
                        after_join.push((filename: string) => {
                            return filename + join_str + item.value;
                        });
                        break;
                    case "Prepend":
                        after_join.push((filename: string) => {
                            return item.value + join_str + filename;
                        });
                        break;
                    case "TimestampEnd":
                        after_join.push((filename: string) => {
                            return filename + dayjs().format(item.value);
                        });
                        break;
                    case "TimestampStart":
                        after_join.push((filename: string) => {
                            return dayjs().format(item.value) + filename;
                        });
                        break;
                }
            }
        }

        let newList: (ListItem & { renamed: string })[] = []
        files.forEach((item) => {
            let filename = item.file?.replace(item.ext || "", "") || "";
            filename = filename.trim();

            for (let idx = 0; idx < before_format.length; idx++) {
                filename = before_format[idx](filename);
            }

            let filenameWords = split(filename);

            filenameWords = filenameWords.map((word: string, idx: number) => {
                for (let index = 0; index < func.length; index++) {
                    word = func[index](word, idx);
                }
                return word;
            });

            let renamed = filenameWords.filter(item => !!item).map(item => item.trim()).join(join_str).trim();

            for (let idx = 0; idx < after_join.length; idx++) {
                renamed = after_join[idx](renamed);
            }

            newList.push({
                renamed: renamed + item.ext,
                ...item,
            })
        });
        setFormatedList(newList);
        return Promise.resolve(newList)
    }

    const handleSelectAll = () => {
        if (selectedFiles.size === files.length) {
            setSelectedFiles(new Set());
        } else {
            setSelectedFiles(new Set(formatedList));
        }
    };

    const handleSingleSelect = (file: FormatedItem) => {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(file)) {
            newSelected.delete(file);
        } else {
            newSelected.add(file);
        }
        setSelectedFiles(newSelected);
    };

    const handleRename = async () => {
        console.log('开始重命名', selectedFiles);
        let result = (await invoke("rename", { list: formatedList })) as string;
        let resultList = JSON.parse(result);
        let newList = formatedList.map((item) => {
            let code = resultList.find(
                (item: Pick<FormatedItem, "key" | "code">) => item.key === item.key
            )?.code;
            return {
                key: md5(item.path),
                path: item.path,
                file: item.renamed,
                ext: item.ext,
                code,
            };
        });

        console.log(newList.map(item => item.path));
        updateFiles(newList);
        // setSelectedFiles(new Set());
        clearRuleId()
    };

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-lg font-medium">选择文件</h2>
            </div>

            {/* 文件列表表头 */}
            <div className="grid grid-cols-12 gap-4 p-2 bg-gray-50 rounded">
                <div className="col-span-1">
                    <input
                        type="checkbox"
                        checked={formatedList.length > 0 && selectedFiles.size === formatedList.length}
                        onChange={handleSelectAll}
                        className="cursor-pointer"
                    />
                </div>
                <div className="col-span-4">原文件名</div>
                <div className="col-span-7">新文件名</div>
                {/* <div className="col-span-2">状态</div> */}
                {/* <div className="col-span-1">操作</div> */}
            </div>

            {/* 文件列表内容 */}
            <div className="flex-1 overflow-auto">
                {formatedList.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        暂无文件，请添加文件
                    </div>
                ) :
                    formatedList.map((file, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4 p-2 border-b">
                            <div className="col-span-1">
                                <input
                                    type="checkbox"
                                    checked={selectedFiles.has(file)}
                                    onChange={() => handleSingleSelect(file)}
                                    className="cursor-pointer"
                                />
                            </div>
                            <div className="col-span-4 truncate text-sm">
                                <TooltipWrap tip={file.file || ''}>{file.file}</TooltipWrap></div>
                            <div className="col-span-7 truncate text-sm">{rule ? <TooltipWrap tip={file.renamed || ''}>{file.renamed}</TooltipWrap> : null}</div>
                            {/* <div className="col-span-2">
                                {file.status === 'success' && (
                                    <span className="text-green-500">✓</span>
                                )}
                                {file.status === 'error' && (
                                    <span className="text-red-500">×</span>
                                )}
                                {file.status === 'pending' && (
                                    <span className="text-gray-500">-</span>
                                )}
                            </div> */}

                            {/* <div className="col-span-1">
                                <button className="text-blue-500">撤销</button>
                            </div> */}
                        </div>
                    ))
                }
            </div>

            {/* 底部操作栏 */}
            <div className="mt-4 flex justify-between items-center">
                <div className="flex gap-2">
                    <Button
                        variant={'outline'}
                        onClick={handleSelectAll}
                        disabled={files.length === 0}
                    >
                        {files.length > 0 && selectedFiles.size === files.length ? '取消全选' : '全选'}
                    </Button>
                    <Button
                        variant={'ghost'}
                        onClick={onClear}
                        disabled={files.length === 0}
                    >
                        清空
                    </Button>
                </div>
                <Button
                    disabled={selectedFiles.size === 0 || !rule}
                    onClick={handleRename}
                >
                    开始重命名
                </Button>
            </div>
        </div>
    );
}; 