import React, { useEffect, useState } from 'react';
import useRuleStore from "@/store/rule_store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import {
    MinusIcon,
    Plus,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { CheckedState } from '@radix-ui/react-checkbox';
interface PropsType {
    onSave: (ruleName?: string) => void;
    editingRuleId?: string | null;
}

enum FormatType {
    Join = "Join",
    Remove = "Remove",
    RemoveReg = "RemoveReg",
    Prepend = "Prepend",
    Append = "Append",
    Replace = "Replace",
    ReplaceReg = "ReplaceReg",
    FormatWord = "FormatWord",
    TimestampStart = "TimestampStart",
    TimestampEnd = "TimestampEnd",

}

export const RuleSettings = (props: PropsType) => {
    const [rules, setRules] = useState<RuleItem[]>([]);
    const [ruleName, setRuleName] = useState("");
    const [id, setId] = useState("");

    const { addRule, editRule } = useRuleStore();
    const storedRules = useRuleStore((state) => state.rulesList);

    useEffect(() => {
        if (props.editingRuleId) {
            const rule = storedRules.find((rule) => rule.id === props.editingRuleId);
            if (rule) {
                setRuleName(rule.name);
                setRules(rule.rules);
                setId(rule.id);
            }
        }
    }, [props.editingRuleId, storedRules]);

    const handleRuleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        i: number,
        k?: "replaced"
    ) => {
        const newRules = [...rules];
        if (k) {
            newRules[i][k] = e.target.value;
        } else {
            newRules[i].value = e.target.value;
        }
        setRules(newRules);
    };

    const handleAddRule = (type: RuleType, value: string = "") => {
        setRules([...rules, { type, value }]);
    };

    const handleCheckedChange = (
        i: number,
        flag: string,
        checked: CheckedState
    ) => {
        const newRules = [...rules];
        if (checked) {
            newRules[i].regFlags = (newRules[i].regFlags || "") + flag;
        } else {
            let reg = new RegExp(flag, "g");
            newRules[i].regFlags = (newRules[i].regFlags || "")?.replace(reg, "");
        }
        setRules(newRules);
    };

    const handleRuleSave = () => {
        if (rules.length === 0) {
            alert("请添加规则");
            return;
        }

        if (!ruleName) {
            alert("请输入规则名称");
            return;
        }

        let newRule: Rule = {
            id: id || crypto.randomUUID(),
            name: ruleName,
            rules: rules,
        };

        if (id) {
            editRule(newRule);
        } else {
            addRule(newRule);
        }
        props.onSave(ruleName);
    };

    return (
        <div className="p-4 flex flex-col gap-4 h-full overflow-y-hidden">
            <React.Fragment>
                <div className="h-full flex flex-col gap-4">
                    <Input
                        placeholder="规则名称"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                    />
                    <ScrollArea className="flex-1">
                        {rules.map((rule, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-start gap-2 p-2">
                                    <MinusIcon
                                        className="text-red-500 cursor-pointer"
                                        onClick={() => setRules(rules.filter((_, idx) => idx !== i))}
                                    />
                                    <div className="w-full">
                                        {/* 规则类型对应的输入界面 */}
                                        {[FormatType.Replace, FormatType.ReplaceReg].includes(rule.type) && (
                                            <div className="grid gap-2">
                                                <Input
                                                    placeholder="查找文本"
                                                    value={rule.value}
                                                    onChange={(e) => handleRuleChange(e, i)}
                                                />
                                                <Input
                                                    placeholder="替换文本"
                                                    value={rule.replaced}
                                                    onChange={(e) => handleRuleChange(e, i, "replaced")}
                                                />
                                                {rule.type === FormatType.ReplaceReg && (
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            id={`case-${i}`}
                                                            checked={rule.regFlags?.includes("i")}
                                                            onCheckedChange={(checked) => handleCheckedChange(i, "i", checked)}
                                                        />
                                                        <label htmlFor={`case-${i}`}>不区分大小写</label>
                                                        <Checkbox
                                                            id={`global-${i}`}
                                                            checked={rule.regFlags?.includes("g")}
                                                            onCheckedChange={(checked) => handleCheckedChange(i, "g", checked)}
                                                        />
                                                        <label htmlFor={`global-${i}`}>全局匹配</label>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {[FormatType.Join, FormatType.Remove, FormatType.RemoveReg, FormatType.Append, FormatType.Prepend, FormatType.TimestampStart, FormatType.TimestampEnd].includes(rule.type) && (
                                            <div className="grid gap-2">
                                                <Input
                                                    placeholder="输入文本"
                                                    value={rule.value}
                                                    onChange={(e) => handleRuleChange(e, i)}
                                                />
                                                {rule.type === FormatType.RemoveReg && (
                                                    <div className="flex items-center gap-4">
                                                        <Checkbox
                                                            id={`case-${i}`}
                                                            checked={rule.regFlags?.includes("i")}
                                                            onCheckedChange={(checked) => handleCheckedChange(i, "i", checked)}
                                                        />
                                                        <label htmlFor={`case-${i}`}>不区分大小写</label>
                                                        <Checkbox
                                                            id={`global-${i}`}
                                                            checked={rule.regFlags?.includes("g")}
                                                            onCheckedChange={(checked) => handleCheckedChange(i, "g", checked)}
                                                        />
                                                        <label htmlFor={`global-${i}`}>全局匹配</label>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {[FormatType.FormatWord].includes(rule.type) && (
                                            <div className="flex items-center gap-4">
                                                <span>{rule.value}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Separator className="my-2" />
                            </React.Fragment>
                        ))}
                    </ScrollArea>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Plus className="mr-2" />
                                添加规则
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* 添加所有规则类型选项 */}
                            <DropdownMenuItem onClick={() => handleAddRule(FormatType.Join)}>
                                连接字符
                            </DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>替换文本</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.Replace)}>
                                        普通替换
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.ReplaceReg)}>
                                        正则替换
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>添加文本</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.Prepend)}>
                                        在文件名前添加
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.Append)}>
                                        在文件名后添加
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.TimestampStart)}>
                                        在文件名前添加时间
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.TimestampEnd)}>
                                        在文件名后添加时间
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>移除文本</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.Remove)}>
                                        普通文本
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.RemoveReg)}>
                                        正则匹配
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>单词格式转换</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.FormatWord, "CamelCase")}>
                                        驼峰式：aa Bb Cc
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.FormatWord, "PascalCase")}>
                                        首字母大写：Aa Bb Cc
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleAddRule(FormatType.FormatWord, "UpperCase")}>
                                        单词大写：AA BB CC
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => props.onSave()}>
                            取消
                        </Button>
                        <Button onClick={handleRuleSave}>
                            保存
                        </Button>
                    </div>
                </div>
            </React.Fragment>
        </div>
    );
};