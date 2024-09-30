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
  Join,
  Remove,
  RemoveReg,
  Prepend,
  Append,
  Replace,
  ReplaceReg,
  FormatWord,
  TimestampStart,
  TimestampEnd,
}

enum FormatWordType {
  CamelCase = "camelCase",
  PascalCase = "PascalCase",
  UpperCase = "UpperCase",
}

interface RuleItem {
  type: keyof typeof FormatType;
  value?: FormatWordType | string;
  replaced?: string;
  regFlags?: string;
}

interface Rule {
  id: string;
  name: string;
  rules: RuleItem[];
}
