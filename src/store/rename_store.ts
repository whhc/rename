import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface RenameState {
  fileList: ListItem[];
  addFiles: (files: ListItem[]) => void;
  removeFile: (file: ListItem) => void;
  removeAll: () => void;
}

const useRenameStore = create<RenameState>()(
  devtools(
    persist(
      (set) => ({
        fileList: [],
        addFiles: (files: FormatedItem[]) =>
          set((state) => ({ fileList: [...state.fileList, ...files] })),
        removeFile: (file) =>
          set((state) => {
            const newList = state.fileList.filter(
              (item) => item.key !== file.key
            );
            return { fileList: newList };
          }),
        removeAll() {
          set(() => ({ fileList: [] }));
        },
      }),
      {
        name: "rename-storage",
      }
    )
  )
);

export default useRenameStore;
