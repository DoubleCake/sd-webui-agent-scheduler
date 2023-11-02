import { createStore } from 'zustand/vanilla';

import { ResponseStatus, Task, TaskHistoryResponse, TaskStatus } from '../types';

type HistoryTasksState = {
  total: number;
  tasks: Task[];
  status?: TaskStatus;
  created_by?: string;
  project?: string;

};

type HistoryTasksActions = {
  refresh: (options?: { limit?: number; offset?: number }) => Promise<TaskHistoryResponse>;
  onFilterStatus: (status?: TaskStatus) => void;
  bookmarkTask: (id: string, bookmarked: boolean) => Promise<ResponseStatus>;
  renameTask: (id: string, name: string) => Promise<ResponseStatus>;
  requeueTask: (id: string) => Promise<ResponseStatus>;
  clearHistory: () => Promise<ResponseStatus>;
  verifyProjectAndCreatedBy : (created_by: string ,password: string ,project:string )=>Promise<ResponseStatus>;
};

export type HistoryTasksStore = ReturnType<typeof createHistoryTasksStore>;

export const createHistoryTasksStore = (initialState: HistoryTasksState) => {
  const store = createStore<HistoryTasksState>()(() => initialState);
  const { getState, setState, subscribe } = store;

  const actions: HistoryTasksActions = {
    refresh: async options => {
      const { limit = 1000, offset = 0 } = options ?? {};
      const status = getState().status ?? '';
      const created_by = getState().created_by ?? "";
      const project = getState().project ?? "";


      return fetch(`/agent-scheduler/v1/history?status=${status}&limit=${limit}&offset=${offset}&created_by=${created_by}&project=${project}`)
        .then(response => response.json())
        .then((data: TaskHistoryResponse) => {
          setState({ ...data }); //仅仅覆盖掉而已。
          return data;
        });
    },

    onFilterStatus: status => { //这里的status，就是重新设置setState
      setState({ status });
      actions.refresh();
    },

    verifyProjectAndCreatedBy: async( created_by: string ,password: string ,project:string)=>{
    return fetch(`/agent-scheduler/v1/queue/verfy?created_by=${created_by}&password=${password}&project=${project}`,{ method: 'POST' ,})
      .then(response => response.json())
      .then((data)=>{
        console.log("====> console "+data);
        if (data.success==true){
          setState({ created_by,project });
          // 遍历列表并逐个隐藏元素
          var elementsToHide = document.querySelectorAll('.tab-nav.scroll-hide.svelte-kqij2n' );  // 显示 主栏目的tab页面。
          for (var i = 0; i < elementsToHide.length; i++) {
              var elementTabs= elementsToHide[i] as HTMLElement;
              elementTabs.style.display = 'block';
          }
          var quicksetting =gradioApp().querySelector( "#quicksettings") as HTMLElement;
          quicksetting.removeAttribute("style")


          // 遍历列表并逐个显示元素
          var elementIDToHide = ["#txt2img_extra_tabs","#txt2img_prompt_container","#txt2img_tools","#txt2img_styles_row","#txt2img_enqueue"]
          for (var i = 0; i < elementIDToHide.length; i++) {
              var element = gradioApp().querySelector( elementIDToHide[i]) as HTMLElement;

              if (element) {
                  element.style.display = 'block'
              }
          }
        }

          return data;
     });
    },




    bookmarkTask: async (id: string, bookmarked: boolean) => {
      return fetch(`/agent-scheduler/v1/task/${id}/${bookmarked ? 'bookmark' : 'unbookmark'}`, {
        method: 'POST',
      }).then(response => response.json());
    },
    renameTask: async (id: string, name: string) => {
      return fetch(`/agent-scheduler/v1/task/${id}/rename?name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(response => response.json());
    },
    requeueTask: async (id: string) => {
      return fetch(`/agent-scheduler/v1/task/${id}/requeue`, { method: 'POST' }).then(response =>
        response.json()
      );
    },
    clearHistory: async () => {
      return fetch('/agent-scheduler/v1/history/clear', { method: 'POST' }).then(response => {
        actions.refresh();
        return response.json();
      });
    },
  };

  return { getState, setState, subscribe, ...actions };
};
