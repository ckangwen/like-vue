export declare class Store<S> {
  constructor(options: StoreOptions<S>);

  readonly state: S;
  readonly getter: any;

  replaceState(state: S): any

  dispatch: Dispatch
  commit: Commit

}

export interface StoreOptions<S = any> {
  state?: S | (() => S);
  getters?: GetterTree<S, S>;
  actions?: ActionTree<S, S>;
  mutations?: MutationTree<S>;
  modules?: ModuleTree<S>;
  plugins?: Plugin<S>[];
  strict?: boolean;
  devtools?: boolean;
}


export interface Payload {
  type: string;
}

/* dispatch */
export interface DispatchOptions {
  root?: boolean;
}
export interface Dispatch {
  (type: string, payload?: any, options?: DispatchOptions): Promise<any>
  <P extends Payload>(payloadWithType: P, options?: DispatchOptions): Promise<any>
}

/* commit */
export interface CommitOptions {
  silent?: boolean;
  root?: boolean;
}
export interface Commit {
  (type: string, payload?: any, options?: CommitOptions): void;
  <P extends Payload>(payloadWithType: P, options?: CommitOptions): void;
}


/* action */
export interface ActionContext<State, RootState> {
  dispatch: Dispatch;
  commit: Commit;
  state: State;
  getters: any;
  rootState: RootState;
  rootGetters: any;
}
export type ActionHandler<S, R> = (this: Store<R>, injectee: ActionContext<S, R>, payload?: any) => any;
export interface ActionObject<S, R> {
  root?: boolean;
  handler: ActionHandler<S, R>;
}

export type Action<S, R> = ActionHandler<S, R> | ActionObject<S, R>

export interface ActionTree<S, R> {
  [key: string]: Action<S, R>
}


/* getter */
export type Getter<S, R> = (state: S, getters: any, rootState: R, rootGetters: any) => any;

export interface GetterTree<S, R> {
  [key: string]: Getter<S, R>;
}


/* mutation */
export type Mutation<S> = (state: S, payload?: any) => any;

export interface MutationTree<S> {
  [key: string]: Mutation<S>;
}


/* module */
export interface Module<S, R> {
  namespaced?: boolean;
  state?: S | (() => S);
  getters?: GetterTree<S, R>;
  actions?: ActionTree<S, R>;
  mutations?: MutationTree<S>;
  modules?: ModuleTree<R>;
}
export type RawModule = Module<any, any>

export interface ModuleTree<R> {
  [key: string]: Module<any, R>;
}


/* plugin */
export type Plugin<S> = (store: Store<S>) => any;
