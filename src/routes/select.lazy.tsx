import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import useRenameStore from "@/store/rename_store";
import { open } from "@tauri-apps/api/dialog";
import { md5 } from "js-md5";
import { CheckIcon, Plus, Trash, Trash2 } from "lucide-react";
import React from "react";
import TooltipWrap from "@/components/tooltip-wrap";

export const Route = createLazyFileRoute("/select")({
  component: () => <SelectPage />,
});

function SelectPage() {
  const fileList = useRenameStore((state) => state.fileList);
  const addFiles = useRenameStore((state) => state.addFiles);
  const removeFile = useRenameStore((state) => state.removeFile);
  const removeAll = useRenameStore((state) => state.removeAll);

  const navigate = useNavigate();
  const handleOpen = async () => {
    const selected = await open({
      directory: false,
      multiple: true,
    });

    if (Array.isArray(selected)) {
      let formatedList: FormatedItem[] = [];
      let keys = fileList.map((item) => item.key);
      selected.forEach((item) => {
        let key = md5(item);
        if (!keys.includes(key)) {
          let fileName = item.split("\\").pop();
          const match = fileName?.match(/\.[^/.]+$/);
          let ext = match ? match[0] : "";
          formatedList.push({
            key,
            path: item,
            file: fileName,
            ext,
          });
        }
      });
      addFiles(formatedList);
    }
  };

  const handleFileRemove = (item: ListItem) => {
    removeFile(item);
  };

  const reset = () => {
    removeAll();
  };

  return (
    <div className="h-screen has-[[data-area=select]:hover]:bg-slate-200">
      {fileList.length > 0 ? (
        <div className="h-screen p-4 flex flex-col">
          <ScrollArea className="flex-1 p-2  relative">
            {fileList.map((item) => (
              <React.Fragment key={item.key}>
                <div
                  className={cn(
                    "text-sm py-1 group grid grid-cols-12 items-center select-none transition-all ease-in-out"
                  )}
                >
                  <div className="col-span-1"></div>
                  <div className="flex items-center justify-between col-span-10">
                    <span className="text-gray-500 group-hover:text-sky-600 col-span-5 break-all ">
                      {item.file}
                    </span>
                    <Button
                      variant={"link"}
                      className="group/delete mr-2 min-w-24 h-full text-center"
                      onClick={() => handleFileRemove(item)}
                    >
                      <Trash className="group-hover/delete:hidden text-gray-300 h-4 min-w-4" />
                      <Trash2 className="hidden group-hover/delete:inline text-red-600 h-4 min-w-4" />
                    </Button>
                  </div>
                </div>
                <Separator className="mx-auto w-10/12 last:hidden" />
              </React.Fragment>
            ))}
          </ScrollArea>
          <div className="flex justify-end items-center mt-auto gap-2">
            <TooltipWrap tip="添加文件">
              <Button
                variant={"ghost"}
                className="text-gray-400 hover:text-gray-700"
                onClick={handleOpen}
              >
                <Plus />
              </Button>
            </TooltipWrap>
            <TooltipWrap tip="清空已选择文件">
              <Button
                variant={"ghost"}
                className="group text-gray-400 hover:text-red-600"
                onClick={reset}
              >
                <Trash className="group-hover:hidden w-4 h-4 mr-1" />
                <Trash2 className="hidden group-hover:inline w-4 h-4 mr-1" />
              </Button>
            </TooltipWrap>
            <Button onClick={() => navigate({ to: "/rule" })}>
              <CheckIcon className="w-4 h-4 mr-1" />
              确定
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <div
            className="p-8 text-center cursor-pointer"
            data-area="select"
            onClick={handleOpen}
          >
            <Plus className="mx-auto" />
            <p>选择文件</p>
          </div>
        </div>
      )}
    </div>
  );
}
