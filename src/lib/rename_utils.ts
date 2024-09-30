export function split(str?: string) {
  if (!str) return [];
  if (str.length === 0) return [];
  let camelCase = /^[a-z0-9]+([A-Z][a-z0-9]*)+$/;
  let PascalCase = /^([A-Z][a-z0-9]*)+$/;

  if (camelCase.test(str) || PascalCase.test(str)) {
    return splitWords(str);
  }

  return str.split(/[^A-Za-z0-9]/).map((item) => item.toLowerCase());
}

export function splitPascalCase(word: string) {
  let wordRe = /($[a-z])|[A-Z][^A-Z]+/g;
  let result = word.match(wordRe);
  if (!result) return [word];
  return result;
}

export function splitWords2(str: string) {
  let output = [];
  let i = 0;
  let l = 0;
  let word = "";
  let capRe = /[A-Z]/;
  for (i = 0, l = str.length; i < l; i += 1) {
    if (i === 0) {
      word = str[i].toLowerCase();
    } else {
      if (i > 0 && capRe.test(str[i])) {
        output.push(word);
        word = str[i].toLowerCase();
      } else {
        word += str[i];
      }
    }
  }
  if (word) {
    output.push(word);
  }
  return output;
}

export function splitWords(s: string) {
  let re;
  let match;
  let output = [];
  re = /([A-Za-z]?)([a-z0-9]+)/g;

  match = re.exec(s);
  while (match) {
    output.push([match[1].toLowerCase(), match[2]].join(""));
    match = re.exec(s);
  }

  return output;
}

export function upperCaseFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const RulesName: { [key in keyof typeof FormatType]: string } = {
  Join: "连接字符",
  Append: "添加文本（后）",
  Prepend: "添加文本（前）",
  Replace: "替换文本",
  ReplaceReg: "替换文本（正则）",
  Remove: "移除文本",
  RemoveReg: "移除文本（正则）",
  FormatWord: "单词转换",
  TimestampStart: "添加时间（前）",
  TimestampEnd: "添加时间（后）",
};

export const RuleTips: { [key in keyof typeof FormatType]: string } = {
  Join: "连接字符，例如：2023-01-01是以 - 连接的，2023/01/01是以 / 连接",
  Remove:
    "移除文本，此条规则将会移除所有匹配到的文本，例如：2023-01-01，移除 - 后，结果为：20230101",
  RemoveReg: "移除文本（正则），此条规则将会移除所有匹配到的文本",
  Prepend: "在文件名前添加文本",
  Append: "在文件名后添加文本",
  Replace:
    "将所有匹配到的文本替换为指定文本，例如：2023-01-01，替换 - 为 /，结果为：2023/01/01",
  ReplaceReg: "将所有匹配到的文本替换为指定文本",
  FormatWord: "转换单词的大小写规则",
  TimestampStart:
    "将当前的时间以指定格式转换并添加在文件名前，以YYYY-MM-DD HH:mm:ss为例，可以设置为：2023-01-01 00:00:00，其中YYYY为年份，MM为月份，DD为日期，HH为小时，mm为分钟，ss为秒",
  TimestampEnd:
    "将当前的时间以指定格式转换并添加在文件名后，以YYYY-MM-DD HH:mm:ss为例，可以设置为：2023-01-01 00:00:00，其中YYYY为年份，MM为月份，DD为日期，HH为小时，mm为分钟，ss为秒",
};
