import type { RecoilState } from 'recoil'
import { atom } from 'recoil'

export type Routes = '/' | '/active' | '/completed'


export interface Payable {
    Id: number;
    TRANNUM: string;
    PERSON: string;
    OFFSET: string;
    ACCRUAL: string;
    POSTMONTH: Date;
    DATE: Date;
    DUEDATE: Date;
    AMOUNT: string;
    PROPERTY: string;
    ACCOUNT: string;
    NOTES: string;
    REF: string;
    CHECKNUM: string;
    DESC: string;
    EXPENSETYPE: string;
    DETAILTAXAMOUNT1: string;
    DETAILTAXAMOUNT2: string;
    DETAILTRANAMOUNT: string;
    DETAILVATTRANTYPEID: string;
    DETAILVATRATEID: string;
    TRANCURRENCYID: string;
    EXCHANGERATE: string;
    EXCHANGERATE2: string;
    AMOUNT2: string;
    DOCUMENTSEQUENCENUMBER: string;
    DISPLAYTYPE: string;
    Company: string;
    FundingEntity: string;
    JOB: string;
    CATEGORY: string;
    CONTRACT: string;
    COSTCODE: string;
    USERDEFINEDFIELD1: string;
    USERDEFINEDFIELD2: string;
    USERDEFINEDFIELD3: string;
    USERDEFINEDFIELD4: string;
    USERDEFINEDFIELD5: string;
    USERDEFINEDFIELD6: string;
    USERDEFINEDFIELD7: string;
    USERDEFINEDFIELD8: string;
    USERDEFINEDFIELD9: string;
    USERDEFINEDFIELD10: string;
    INTERNATIONALPAYMENTTYPE: string;
    WORKFLOW: string;
    WORKFLOWSTATUS: string;
    WORKFLOWSTEP: string;
    DETAILFIELD1: string;
    DETAILFIELD2: string;
    DETAILFIELD3: string;
    DETAILFIELD4: string;
    DETAILFIELD5: string;
    DETAILFIELD6: string;
    DETAILFIELD7: string;
    DETAILFIELD8: string;
    NOTES2: string;
    PONUM: string;
    PODETAILID: string;
    TRANDATE: string;
    RETENTION: string;
    ORIGINALUREF: string;
    CREDITMEMO: string;
    ADJUSTMENT: string;
    Labour: string;
    Material: string;
    CITBLevy: string;
    ManufacturingCosts: string;
    Travel: string;
    NonCisLabor: string;
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
