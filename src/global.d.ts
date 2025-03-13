type FormatedItem = {
  key: string;
  path: string;
  ext?: string;
  file?: string;
  renamed?: string;
  code?: 0 | 1;
};

type ListItem = Omit<FormatedItem, "renamed" | "code">;

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

enum FormatWordType {
  CamelCase = "camelCase",
  PascalCase = "PascalCase",
  UpperCase = "UpperCase",
}

// type RuleType = keyof typeof FormatType;
// FormatType中的所有value成为一个联合类型
type RuleType = typeof FormatType[keyof typeof FormatType];

interface RuleItem {
  type: RuleType;
  value?: FormatWordType | string;
  replaced?: string;
  regFlags?: string;
}

interface Rule {
  id: string;
  name: string;
  rules: RuleItem[];
}