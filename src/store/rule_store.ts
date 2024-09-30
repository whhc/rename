import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useRuleStore = create<{
  rulesList: Rule[];
  addRule: (rule: Rule) => void;
  editRule: (rule: Rule) => void;
  removeRule: (id: string) => void;
}>()(
  devtools(
    persist(
      (_set) => ({
        rulesList: [],
        editRule: (rule: Rule) => {
          _set((state) => ({
            rulesList: state.rulesList.map((item) =>
              item.id === rule.id ? rule : item
            ),
          }));
        },
        addRule: (rule: Rule) => {
          _set((state) => ({
            rulesList: [...state.rulesList, rule],
          }));
        },
        removeRule: (id: string) => {
          _set((state) => ({
            rulesList: state.rulesList.filter((rule) => rule.id !== id),
          }));
        },
      }),
      {
        name: "rules-storage",
      }
    )
  )
);

export default useRuleStore;
