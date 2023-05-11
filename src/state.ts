import { create, State } from "zustand";
import { IClientModel } from "~client/client.service";

export interface AppStateModel  {
  clients: IClientModel[];
}
export const store = create<AppStateModel>(() => ({
  clients: [],
}));

export const AppStateActions = {
  setClients: (clients: IClientModel[]) => {
    store.setState({ clients });
  },
}
