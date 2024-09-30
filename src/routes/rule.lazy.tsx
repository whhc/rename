import RuleCreate from "@/components/rule-create";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { split, upperCaseFirst } from "@/lib/rename_utils";
import useRenameStore from "@/store/rename_store";
import useRuleStore from "@/store/rule_store";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api";
import dayjs from "dayjs";
import { CheckIcon, ListIcon, MoveRightIcon, Undo2Icon } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createLazyFileRoute("/rule")({
  component: () => <RulePage />,
});

function RulePage() {
  const navigate = useNavigate();
  const fileList = useRenameStore((state) => state.fileList);
  const removeAll = useRenameStore((state) => state.removeAll);
  const storedRules = useRuleStore((state) => state.rulesList);
  const [formatedList, setFormatedList] = useState<FormatedItem[]>(fileList);
  const [format, setFormat] = useState<RuleItem[]>([]);
  const [complete, setComplete] = useState(false);

  const [showCustomRules, setShowCustomRules] = useState(false);
  const formatList = () => {
    let join_str = " ";

    let _format = [...format];
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
    let newList = fileList.map((item) => {
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

      let renamed = filenameWords.join(join_str).trim();

      for (let idx = 0; idx < after_join.length; idx++) {
        renamed = after_join[idx](renamed);
      }

      return {
        renamed: renamed + item.ext,
        ...item,
      };
    });
    setFormatedList(newList);
  };

  const handleRenameTypeChange = (value: string) => {
    if (value === "1") {
      setFormat(() => [{ type: "Join", value: "_" }]);
      // 下划线
    } else if (value === "2") {
      setFormat(() => [{ type: "Join", value: "-" }]);
      // 中横线
    } else if (value === "3") {
      setFormat(() => [
        { type: "FormatWord", value: "CamelCase" },
        { type: "Join", value: "" },
      ]);
    } else if (value === "5") {
      setFormat(() => [{ type: "FormatWord", value: "PascalCase" }]);
    } else if (value === "6") {
      setFormat(() => [{ type: "FormatWord", value: "UpperCase" }]);
    } else if (value === "7") {
      setShowCustomRules(true);
    } else if (value.length > 1) {
      let rule = storedRules.find((item) => item.id === value);
      setFormat(rule?.rules || []);
    }
  };

  const handleRename = async () => {
    if (!format.length) alert("请先选择重命名格式");

    let result = (await invoke("rename", { list: formatedList })) as string;
    let resultList = JSON.parse(result);

    let newList = formatedList.map((item) => {
      let code = resultList.find(
        (item: Pick<FormatedItem, "key" | "code">) => item.key === item.key
      )?.code;
      return {
        ...item,
        code,
      };
    });
    setFormatedList(newList);
    removeAll();
    setComplete(true);
  };

  const handleRulesConfirm = (rules: RuleItem[]) => {
    setFormat(rules);
    setShowCustomRules(false);
  };

  useEffect(() => {
    if (format.length) {
      formatList();
    }
  }, [format]);

  useEffect(() => {
    console.log(format);
  }, [showCustomRules]);

  return (
    <div className="p-4 h-screen flex flex-col gap-4">
      <div className="flex gap-2 items-center">
        <Select onValueChange={handleRenameTypeChange}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="选择重命名方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">[预设] 下划线连接</SelectItem>
            <SelectItem value="2">[预设] 中横线连接</SelectItem>
            <SelectItem value="3">[预设] 驼峰式</SelectItem>
            <SelectItem value="5">[预设] 首字母大写</SelectItem>
            <SelectItem value="6">[预设] 全大写</SelectItem>
            {storedRules.map((item, index) => (
              <SelectItem key={index} value={item.id}>
                [自定义] {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <ListIcon
                className="w-4 h-4 text-gray-500"
                onClick={() => setShowCustomRules(true)}
              />
            </TooltipTrigger>
            <TooltipContent>
              <span>自定义规则管理</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ScrollArea className="w-full flex-1">
        {formatedList.map((item, index) => (
          <div
            key={index}
            className="flex items-center p-2 text-slate-500 text-sm gap-2"
          >
            {item.code === 0 ? (
              <CheckIcon className="w-4 h-4 text-teal-500" />
            ) : null}
            {item.file}
            <MoveRightIcon className="w-4 h-4" />
            {item.renamed || item.file}
          </div>
        ))}
      </ScrollArea>
      <div className="mt-auto flex justify-end gap-2">
        <Button
          variant={"ghost"}
          className="text-slate-400"
          onClick={() => navigate({ to: "/select" })}
        >
          <Undo2Icon />
        </Button>
        {!complete && <Button onClick={handleRename}>确定</Button>}
      </div>

      <Sheet open={showCustomRules} onOpenChange={setShowCustomRules}>
        <SheetContent
          side="right"
          className="w-[960px] sm:w-[960px] sm:max-w-full max-w-full overflow-y-scroll"
        >
          <SheetHeader>
            <SheetTitle>自定义规则</SheetTitle>
            <SheetDescription>
              支持正则表达式，可按照需求逐步添加重命名规则
            </SheetDescription>
          </SheetHeader>
          <RuleCreate onRuleConfirm={handleRulesConfirm} rules={format} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
