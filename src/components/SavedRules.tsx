import useRuleStore from '@/store/rule_store';
import React from 'react';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface SavedRulesProps {
    selectedRule: string;
    onSelectRule: (ruleName: string) => void;
    onAddNewRule: () => void;
    onEditRule: (ruleId: string) => void;
}

export const SavedRules: React.FC<SavedRulesProps> = ({
    selectedRule,
    onSelectRule,
    onAddNewRule,
    onEditRule
}) => {
    const rulesList = useRuleStore((state) => state.rulesList);
    const { removeRule } = useRuleStore();
    return (
        <div className='h-full overflow-y-hidden flex flex-col'>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">已保存的规则</h2>
                <Button
                    onClick={onAddNewRule}
                    variant={'outline'}
                >
                    添加新规则
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-2">
                    {rulesList.map((rule) => (
                        <div
                            key={rule.id}
                            className={`p-3 rounded flex justify-between items-center bg-gray-50 ${selectedRule === rule.id ? 'border border-primary' : 'border border-white'} cursor-pointer`}
                            onClick={() => onSelectRule(rule.id)}
                        >
                            <div
                                className="flex-1 cursor-pointer"
                            >
                                {rule.name}
                            </div>
                            <Button
                                variant={'ghost'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeRule(rule.id);
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                variant={'ghost'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditRule(rule.id);
                                }}
                            >
                                编辑
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
