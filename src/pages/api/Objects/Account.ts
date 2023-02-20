export type Account = {
    id: number;
    account_Code: string;
    normal_Balance: string;
    account_Type: string;
    report_Type: string;
    description: string;
    user_defined_1: string;
    user_defined_2: string;
    user_defined_3: string;
    user_defined_4: string;
    exempt_1099: string;
    cash_Account: string;
    tenant_Deposit: string;
    commisionable: string;
    subject_to_Late_Fee: string;
    prepay_Holding: string;
    exclude_from_Use: string;
    aP_Account: string;
    control_Account: string;
    expense_Account: string;
    print_End_Inc_Stmt_Perc: string;
    exclude_from_Reg: string;
    include_in_Cash_Flow: string;
    percentage_Divisor: string;
    suppress_Financial: string;
    summary: string;
    aR_Account: string;
    wIP_Account: string;
    exclude_from_Budget: string;
    margin: string;
    advance: string;
    double_Underline: string;
    print_Bold: string;
    print_Italic: string;
    total_Into: string;
    offset: string;
    hold_For: string;
    payable: string;
    receivable: string;
    system_Account: string;
    chart: string;
    tax_Account: string;
    construction: string;
    exclude_From_AP_IAT: string;
    recoverability: string;
    iAT_Account: string;
    prepaid_AR_Account: string;
    notes: string;
    row: string;
    hiddenColumn: string;
}

export const emptyAccount = {
    id: 0,
    account_Code: "",
    normal_Balance: "",
    account_Type: "",
    report_Type: "",
    description: "",
    user_defined_1: "",
    user_defined_2: "",
    user_defined_3: "",
    user_defined_4: "",
    exempt_1099: "",
    cash_Account: "",
    tenant_Deposit: "",
    commisionable: "",
    subject_to_Late_Fee: "",
    prepay_Holding: "",
    exclude_from_Use: "",
    aP_Account: "",
    control_Account: "",
    expense_Account: "",
    print_End_Inc_Stmt_Perc: "",
    exclude_from_Reg: "",
    include_in_Cash_Flow: "",
    percentage_Divisor: "",
    suppress_Financial: "",
    summary: "",
    aR_Account: "",
    wIP_Account: "",
    exclude_from_Budget: "",
    margin: "",
    advance: "",
    double_Underline: "",
    print_Bold: "",
    print_Italic: "",
    total_Into: "",
    offset: "",
    hold_For: "",
    payable: "",
    receivable: "",
    system_Account: "",
    chart: "",
    tax_Account: "",
    construction: "",
    exclude_From_AP_IAT: "",
    recoverability: "",
    iAT_Account: "",
    prepaid_AR_Account: "",
    notes: "",
    row: "",
    hiddenColumn: "",
}

export const AccountProperties: Account = Object.keys(emptyAccount).reduce(
    (acc, key) => ({ ...acc, [key]: "" }),
    {} as Account
  );

  export function isAccount(object: any): object is Account {
    return 'id' in object && 'Account_Code' in object;
  }