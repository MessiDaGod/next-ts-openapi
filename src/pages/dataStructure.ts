import type { RecoilState } from 'recoil'
import { atom } from 'recoil'

export type Routes = '/' | '/active' | '/completed'

export interface Payable {
  Id: number;
  TRANNUM: string | null;
  PERSON: string | null;
  OFFSET: string | null;
  ACCRUAL: string | null;
  POSTMONTH: Date | null;
  DATE: Date | null;
  DUEDATE: Date | null;
  AMOUNT: string | null;
  PROPERTY: string | null;
  ACCOUNT: string | null;
  NOTES: string | null;
  REF: string | null;
  CHECKNUM: string | null;
  DESC: string | null;
  EXPENSETYPE: string | null;
  DETAILTAXAMOUNT1: string | null;
  DETAILTAXAMOUNT2: string | null;
  DETAILTRANAMOUNT: string | null;
  DETAILVATTRANTYPEID: string | null;
  DETAILVATRATEID: string | null;
  TRANCURRENCYID: string | null;
  EXCHANGERATE: string | null;
  EXCHANGERATE2: string | null;
  AMOUNT2: string | null;
  DOCUMENTSEQUENCENUMBER: string | null;
  DISPLAYTYPE: string | null;
  Company: string | null;
  FundingEntity: string | null;
  JOB: string | null;
  CATEGORY: string | null;
  CONTRACT: string | null;
  COSTCODE: string | null;
  USERDEFINEDFIELD1: string | null;
  USERDEFINEDFIELD2: string | null;
  USERDEFINEDFIELD3: string | null;
  USERDEFINEDFIELD4: string | null;
  USERDEFINEDFIELD5: string | null;
  USERDEFINEDFIELD6: string | null;
  USERDEFINEDFIELD7: string | null;
  USERDEFINEDFIELD8: string | null;
  USERDEFINEDFIELD9: string | null;
  USERDEFINEDFIELD10: string | null;
  INTERNATIONALPAYMENTTYPE: string | null;
  WORKFLOW: string | null;
  WORKFLOWSTATUS: string | null;
  WORKFLOWSTEP: string | null;
  DETAILFIELD1: string | null;
  DETAILFIELD2: string | null;
  DETAILFIELD3: string | null;
  DETAILFIELD4: string | null;
  DETAILFIELD5: string | null;
  DETAILFIELD6: string | null;
  DETAILFIELD7: string | null;
  DETAILFIELD8: string | null;
  NOTES2: string | null;
  PONUM: string | null;
  PODETAILID: string | null;
  TRANDATE: string | null;
  RETENTION: string | null;
  ORIGINALUREF: string | null;
  CREDITMEMO: string | null;
  ADJUSTMENT: string | null;
  Labour: string | null;
  Material: string | null;
  CITBLevy: string | null;
  ManufacturingCosts: string | null;
  Travel: string | null;
  NonCisLabor: string | null;
}

export type PayableType = Payable[]

export interface AppState {
  payableList: PayableType
}

export enum LocalStorageKey {
  APP_STATE = 'APP_STATE',
}

function LoadAppStateFromLocalStorage(): AppState {
  const stringifiedJSON: string | null = window.localStorage.getItem(
    LocalStorageKey.APP_STATE
  )
  if (typeof stringifiedJSON === 'string') {
    const Loaded: AppState = JSON.parse(stringifiedJSON)
    return Loaded
  }

  const BlankAppState: AppState = {
    payableList: [],
  }

  return BlankAppState
}

export const recoilState: RecoilState<AppState> = atom({
  default: LoadAppStateFromLocalStorage(),
  key: 'initialAppState',
})
