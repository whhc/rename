import { createLazyFileRoute } from '@tanstack/react-router'

import { cn } from '@/lib/utils'
import { MoveRight, Plus, X, Check, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { open } from '@tauri-apps/api/dialog'
import { md5 } from 'js-md5'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { invoke } from '@tauri-apps/api'
import { Input } from '@/components/ui/input'
import dayjs from 'dayjs'

export const Route = createLazyFileRoute('/old_index')({
  component: () => <SelectPage />,
})

type FormatedItem = {
  key: string
  path: string
  ext?: string
  file?: string
  renamed?: string
  code?: 0 | 1
}

function SelectPage() {
  const [list, setList] = useState<FormatedItem[]>([])
  const [formatedList, setFormatedList] = useState<FormatedItem[]>([])
  const [type, setType] = useState('')
  const [matchRegex, setMatchRegex] = useState('')
  const [replaceRegex, setReplaceRegex] = useState('')
  const handleOpen = async () => {
    const selected = await open({
      directory: false,
      multiple: true,
    })

    if (Array.isArray(selected)) {
      let formatedList: FormatedItem[] = []
      let keys = list.map((item) => item.key)
      selected.forEach((item) => {
        let key = md5(item)
        if (!keys.includes(key)) {
          let fileName = item.split('\\').pop()
          const match = fileName?.match(/\.[^/.]+$/)
          let ext = match ? match[0] : ''
          formatedList.push({
            key,
            path: item,
            file: fileName,
            ext,
          })
        }
      })
      setList([...list, ...formatedList])
    }
  }

  const handleFileRemove = (key: string) => {
    setList(list.filter((item) => item.key !== key))
  }

  const handleTypeChange = (value: string) => {
    setType(value)
  }

  const handleRename = async () => {
    let result = (await invoke('rename', { list: formatedList })) as string
    let resultList = JSON.parse(result)

    let newList = formatedList.map((item) => {
      let code = resultList.find(
        (item: Pick<FormatedItem, 'key' | 'code'>) => item.key === item.key,
      )?.code
      return {
        ...item,
        code,
      }
    })
    setFormatedList(newList)
  }

  const reset = () => {
    setList([])
    // setFormatedList([]);
  }

  const handleRegChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'match' | 'replace',
  ) => {
    let value = e.target.value
    if (type === 'match') {
      setMatchRegex(value)
    } else {
      setReplaceRegex(value)
    }
  }

  const handleRuleSave = () => {
    console.log('match   => ', matchRegex)
    console.log('replace => ', replaceRegex)
  }

  const handleRenameByJoin = (str: string, list: FormatedItem[]) => {
    let newList = list.map((item) => {
      let filename = item.file?.replace(item.ext || '', '')
      filename = filename?.replace(/[^a-zA-Z0-9]/g, str)
      filename && (filename = filename + item.ext)
      return {
        ...item,
        renamed: filename,
      }
    })
    return newList
  }

  useEffect(() => {
    if (type === '1') {
      setFormatedList(handleRenameByJoin('_', list))
    } else if (type === '2') {
      setFormatedList(handleRenameByJoin('-', list))
    } else if (type === '3') {
      let newList = list.map((item) => {
        let filename = item.file?.replace(item.ext || '', '')
        let _arr = filename?.split(/[^a-zA-Z0-9]+/g)
        if (Array.isArray(_arr)) {
          filename = _arr
            .map((item) => {
              return item.charAt(0).toUpperCase() + item.slice(1)
            })
            .join('')
        }
        if (filename) {
          filename = filename.charAt(0).toLowerCase() + filename.slice(1)
          filename = filename + item.ext
        }
        return {
          ...item,
          renamed: filename,
        }
      })
      setFormatedList(newList)
    } else if (type === '5') {
      let _list = list.filter((item) => item.file?.startsWith('aaanr.com_'))
      _list = _list.map((item) => {
        let filename = item.file?.replace(item.ext || '', '')
        filename = filename?.replace(/aaanr\.com_(.*?_)+/, '')
        filename = filename?.replace(/[^a-zA-Z0-9]+/g, '-')
        filename = `${dayjs().format('YYYY-MM-DD.')}${filename}`
        filename && (filename = filename + item.ext)
        return {
          ...item,
          renamed: filename,
        }
      })
      console.log(_list)
      setFormatedList(_list)
    } else {
      setFormatedList(list)
    }
  }, [type, list])

  return (
    <div className="p-4">
      <h3 className="text-4xl font-sans text-center font-bold hidden">
        Rename
      </h3>
      <div className="flex items-center justify-center">
        <div
          className={cn(
            'p-4  flex items-center justify-center mt-8 w-48 h-12  cursor-pointer group',
          )}
          onClick={handleOpen}
        >
          <Plus className="w-10 h-10 group-active:scale-110" color="#475569" />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-4 justify-end py-1 h-6">
          <Trash2
            className={cn(
              'cursor-pointer w-4 h-4 text-gray-500 hidden',
              list.length > 0 && 'block',
            )}
            onClick={reset}
          />
        </div>
        <ScrollArea className="h-72 border rounded">
          {formatedList.map((item) => (
            <div
              className={cn(
                'text-sm my-1 group grid grid-cols-12 items-center',
              )}
              key={item.key}
            >
              <div className="flex items-center col-span-6">
                <Button
                  size="icon"
                  variant={'link'}
                  className="mr-2 invisible group-hover:visible min-w-9"
                  onClick={() => handleFileRemove(item.key)}
                >
                  <X className="text-gray-500 group-hover:text-sky-600 w-4 h-4 min-w-4" />
                </Button>
                <span className="text-gray-500 group-hover:text-sky-600 col-span-5 break-all ">
                  {item.file}
                </span>
              </div>
              {item.renamed && (
                <div className="flex items-center col-span-5">
                  <MoveRight className="w-4 h-4 min-w-4 group-hover:text-sky-600 mr-2" />
                  <span className="text-gray-500 group-hover:text-sky-600 break-all">
                    {item.renamed}
                  </span>
                </div>
              )}
              {item.code === 0 && <Check className="text-green-500 w-4 h-4" />}
            </div>
          ))}
        </ScrollArea>
      </div>

      <div className="mt-8 ">
        <div className="flex items-center gap-2">
          <Select onValueChange={handleTypeChange}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="选择重命名方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">下划线</SelectItem>
              <SelectItem value="2">中横线</SelectItem>
              <SelectItem value="3">驼峰式</SelectItem>
              <SelectItem value="4">正则</SelectItem>
              <SelectItem value="5">木薯专用</SelectItem>
            </SelectContent>
          </Select>
          {type === '4' && (
            <Button variant={'ghost'} onClick={handleRuleSave}>
              保存
            </Button>
          )}
        </div>

        {type === '4' && (
          <div className="mt-4">
            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="text-sm text-gray-500 col-span-2">
                匹配规则
              </label>
              <Input
                className="col-span-5"
                onChange={(val) => handleRegChange(val, 'match')}
              />
            </div>
            <div className="grid grid-cols-12 gap-2 items-center mt-2">
              <label className="text-sm text-gray-500 col-span-2">
                替换规则
              </label>
              <Input
                className="col-span-5"
                onChange={(val) => handleRegChange(val, 'replace')}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Button variant={'default'} onClick={handleRename}>
          开始
        </Button>
      </div>
    </div>
  )
}
