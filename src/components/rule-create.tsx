import { RulesName, RuleTips } from "@/lib/rename_utils";
import useRuleStore from "@/store/rule_store";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  CircleHelpIcon,
  EditIcon,
  MinusIcon,
  MoveRightIcon,
  Plus,
  PlusIcon,
} from "lucide-react";
import React, { memo, useEffect, useState } from "react";
import TooltipWrap from "./tooltip-wrap";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

type RuleCreateProps = {
  onRuleConfirm: (rules: RuleItem[]) => void;
  rules: RuleItem[];
};

const RuleCreate = memo((props: RuleCreateProps) => {
  const [rules, setRules] = useState<RuleItem[]>(props.rules);
  const [ruleName, setRuleName] = useState("");
  const [createMode, setCreateMode] = useState(false);
  const [id, setId] = useState("");
  const addRule = useRuleStore((state) => state.addRule);
  const removeRule = useRuleStore((state) => state.removeRule);
  const editRule = useRuleStore((state) => state.editRule);
  const storedRules = useRuleStore((state) => state.rulesList);

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

  const handleAddRule = (type: keyof typeof FormatType, value: string = "") => {
    setRules([...rules, { type, value }]);
  };
  const handleRuleSave = () => {
    if (rules.length == 0) {
      alert("请添加规则");
      return;
    }

    if (!ruleName) {
      alert("请输入规则名称");
      return;
    }

    if (id) {
      let rule: Rule = {
        id,
        name: ruleName,
        rules: rules,
      };
      editRule(rule);
    } else {
      let rule: Rule = {
        id: crypto.randomUUID(),
        name: ruleName,
        rules: rules,
      };
      addRule(rule);
    }

    setCreateMode(false);
  };
  const handleRuleApply = (rules: RuleItem[]) => {
    props.onRuleConfirm(rules);
  };

  const handleEdit = (rule: Rule) => {
    setRuleName(rule.name);
    setRules(rule.rules);
    setId(rule.id);
    setCreateMode(true);
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
    console.log(newRules[i]);
    setRules(newRules);
  };

  const handleAddNew = () => {
    setCreateMode(true);
    setRuleName("");
    setRules([]);
    setId("");
  };

  useEffect(() => {
    if (storedRules.length === 0) {
      setCreateMode(true);
    }
  }, []);

  return (
    <div className="p-2 flex flex-col gap-2">
      {createMode ? (
        <React.Fragment>
          <ScrollArea className="flex-1">
            <div className="p-2 flex items-center">
              <Input
                placeholder="规则名称"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
              />
              <TooltipWrap tip="规则选择列表中显示的名称">
                <CircleHelpIcon className="ml-2 w-6 h-6 text-gray-400 hover:text-gray-600" />
              </TooltipWrap>
            </div>
            {rules.map((rule, i) => (
              <React.Fragment key={i}>
                <div className="flex items-start gap-2 p-1 w-full" key={i}>
                  <TooltipWrap tip="删除此步骤">
                    <MinusIcon
                      className="text-red-500"
                      onClick={() =>
                        setRules(rules.filter((_, i2) => i2 !== i))
                      }
                    />
                  </TooltipWrap>
                  <div className="w-full">
                    {[
                      "Join",
                      "Remove",
                      "RemoveReg",
                      "Append",
                      "Prepend",
                      "TimestampStart",
                      "TimestampEnd",
                    ].includes(rule.type) ? (
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3 flex items-start">
                          <TooltipWrap tip={RuleTips[rule.type]}>
                            <CircleHelpIcon className="inline w-6 h-6 mr-1 text-gray-400" />
                          </TooltipWrap>
                          {RulesName[rule.type]}
                        </div>
                        <Input
                          className="col-span-9"
                          value={rule.value}
                          onChange={(e) => handleRuleChange(e, i)}
                        />
                        {rule.type === "RemoveReg" && (
                          <div className="col-span-6 col-start-7 select-none flex items-center justify-end">
                            <Checkbox
                              className="mr-2"
                              id={`rule-${i}-reg`}
                              checked={rule.regFlags?.includes("i")}
                              onCheckedChange={(checked) => {
                                handleCheckedChange(i, "i", checked);
                              }}
                            />
                            <label htmlFor={`rule-${i}-reg`}>
                              不区分大小写
                            </label>
                            <Checkbox
                              checked={rule.regFlags?.includes("g")}
                              className="ml-4 mr-2"
                              id={`rule-${i}-reg-global`}
                              onCheckedChange={(checked) => {
                                handleCheckedChange(i, "g", checked);
                              }}
                            />
                            <label htmlFor={`rule-${i}-reg-global`}>
                              全局匹配
                            </label>
                          </div>
                        )}
                      </div>
                    ) : null}
                    {["Replace", "ReplaceReg"].includes(rule.type) ? (
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <TooltipWrap tip={RuleTips[rule.type]}>
                            <CircleHelpIcon className="inline w-6 h-6 mr-1 text-gray-400" />
                          </TooltipWrap>
                          <span>
                            查找文本{" "}
                            {rule.type == "ReplaceReg" ? "（正则）" : ""}{" "}
                          </span>
                        </div>
                        <Input
                          className="col-span-9"
                          value={rule.value}
                          onChange={(e) => handleRuleChange(e, i)}
                        />
                        <span className="col-span-3">替换文本</span>
                        <Input
                          className="col-span-9"
                          value={rule.replaced}
                          onChange={(e) => handleRuleChange(e, i, "replaced")}
                        />
                        {rule.type === "ReplaceReg" && (
                          <div className="col-span-6 col-start-7 select-none flex items-center justify-end">
                            <Checkbox
                              className="mr-2"
                              id={`rule-${i}-reg`}
                              checked={rule.regFlags?.includes("i")}
                              onCheckedChange={(checked) => {
                                handleCheckedChange(i, "i", checked);
                              }}
                            />
                            <label htmlFor={`rule-${i}-reg`}>
                              不区分大小写
                            </label>
                            <Checkbox
                              className="ml-4 mr-2"
                              id={`rule-${i}-reg-global`}
                              checked={rule.regFlags?.includes("g")}
                              onCheckedChange={(checked) => {
                                handleCheckedChange(i, "g", checked);
                              }}
                            />
                            <label htmlFor={`rule-${i}-reg-global`}>
                              全局匹配
                            </label>
                          </div>
                        )}
                      </div>
                    ) : null}
                    {["FormatWord"].includes(rule.type) && (
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3 flex items-center">
                          <TooltipWrap tip={RuleTips[rule.type]}>
                            <CircleHelpIcon className="inline w-6 h-6 mr-1 text-gray-400" />
                          </TooltipWrap>
                          <span>{RulesName[rule.type]}</span>
                        </div>
                        <div className="col-span-9 flex items-center gap-2">
                          <span>
                            {rule.value == "CamelCase" && "驼峰式："}
                            {rule.value == "PascalCase" && "首字母大写："}
                            {rule.value == "UpperCase" && "单词大写："}
                          </span>
                          <span>aa bb cc</span>
                          <MoveRightIcon className="text-gray-500" />
                          <span>
                            {rule.value == "CamelCase" && "aa Bb Cc"}
                            {rule.value == "PascalCase" && "Aa Bb Cc"}
                            {rule.value == "UpperCase" && "AA BB CC"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Separator className="my-2 last-of-type:hidden" />
              </React.Fragment>
            ))}
          </ScrollArea>
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center gap-2 border border-solid py-2 px-4 rounded-lg border-slate-400 mt-8">
                <Plus className="cursor-pointer w-8 h-8" />
                <span className="text-sm">添加步骤</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleAddRule("Join")}>
                  更改连接字符（默认空格）
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>添加文本</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("Prepend")}
                      >
                        在文件名前添加
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddRule("Append")}>
                        在文件名后添加
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("TimestampStart")}
                      >
                        在文件名前添加时间
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("TimestampEnd")}
                      >
                        在文件名后添加时间
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>移除文本</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => handleAddRule("Remove")}>
                        普通文本
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("RemoveReg")}
                      >
                        正则匹配
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>替换文本</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("Replace")}
                      >
                        普通文本
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("ReplaceReg")}
                      >
                        正则匹配
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>单词格式转换</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("FormatWord", "CamelCase")}
                      >
                        驼峰式：aa Bb Cc
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleAddRule("FormatWord", "PascalCase")
                        }
                      >
                        首字母大写：Aa Bb Cc
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAddRule("FormatWord", "UpperCase")}
                      >
                        单词大写：AA BB CC
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 justify-end fixed right-0 left-0 bottom-0 p-2">
            <Button variant={"ghost"} onClick={() => setCreateMode(false)}>
              取消
            </Button>
            {!id && (
              <TooltipWrap tip="不保存并立即使用">
                <Button
                  variant={"ghost"}
                  onClick={() => handleRuleApply(rules)}
                >
                  单次使用
                </Button>
              </TooltipWrap>
            )}
            <Button onClick={handleRuleSave}>保存</Button>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <ScrollArea className="h-full">
            {storedRules.map((rule, index) => (
              <React.Fragment key={index}>
                <div key={index} className="flex items-center gap-2">
                  <TooltipWrap tip="删除规则">
                    <Button
                      size="icon"
                      variant={"ghost"}
                      onClick={() => removeRule(rule.id)}
                      className="w-6 h-6 text-red-500 hover:text-red-600"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </Button>
                  </TooltipWrap>
                  <TooltipWrap tip="编辑规则">
                    <Button
                      size="icon"
                      variant={"ghost"}
                      onClick={() => handleEdit(rule)}
                      className="w-6 h-6 text-gray-500"
                    >
                      <EditIcon className="w-4 h-4" />
                    </Button>
                  </TooltipWrap>
                  <span className="text-sm">{rule.name}</span>
                </div>
                <Separator className="my-2 last:hidden" />
              </React.Fragment>
            ))}
          </ScrollArea>
          <div className="p-4 fixed right-0 bottom-0">
            <TooltipWrap tip="新建规则">
              <Button size="icon" variant={"ghost"} onClick={handleAddNew}>
                <PlusIcon />
              </Button>
            </TooltipWrap>
          </div>
        </React.Fragment>
      )}
    </div>
  );
});

export default RuleCreate;
