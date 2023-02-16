export type FinVendorEtl = {
    id: number;
    vendor_Code: string;
    currency: string;
    tax_Authority: string;
    ext_Ref_Vendor_Id: string;
    last_Name: string;
    first_Name: string;
    salutation: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone_Number_1: string;
    phone_Number_2: string;
    phone_Number_3: string;
    phone_Number_4: string;
    phone_Number_5: string;
    phone_Number_6: string;
    phone_Number_7: string;
    phone_Number_8: string;
    phone_Number_9: string;
    phone_Number_10: string;
    government_ID: string;
    government_Name: string;
    email: string;
    alternate_Email: string;
    workers_Comp_Expiration_Date: string;
    liability_Expiration_Date: string;
    contact: string;
    is_Contractor: string;
    is_InActive: string;
    inActive_Date: string;
    is_Require_Contract: string;
    user_Defined_Field1: string;
    user_Defined_Field2: string;
    user_Defined_Field3: string;
    user_Defined_Field4: string;
    user_Defined_Field5: string;
    user_Defined_Field6: string;
    user_Defined_Field7: string;
    user_Defined_Field8: string;
    user_Defined_Field9: string;
    user_Defined_Field10: string;
    user_Defined_Field11: string;
    user_Defined_Field12: string;
    gets: string;
    usual_Account_Code: string;
    default_AP_Account: string;
    default_Cash_Account: string;
    sales_Tax: string;
    tax_Registered: string;
    tax_Registration_Number: string;
    domestic_Tax_Tran_Type: string;
    cross_Border_Tax_Tran_Type: string;
    tax_Point: string;
    pST_Exempt: string;
    notes: string;
    consolidate: string;
    cheque_Memo_From_Invoice: string;
    hold_Payments: string;
    eFT: string;
    no_Signature: string;
    on_Cheques_Over: string;
    memo: string;
    pO_Required: string;
    discount_Percent: string;
    discount_Day: string;
    payment_Terms: string;
    days_From_Invoice_Or_Month: string;
    employee: string;
    vendor_Priority: string;
    language: string;
    tag: string;
    vendor_Status: string;
    expense_Type: string;
    priority: string;
    prop_Prompt: string;
    no_Duplicate_Invoice_on_Same_Date: string;
    [key: string]: string | number;
}


// type Column<T> = {
//   accessorKey: keyof T;
//   header?: string;
//   cell?: (info: any) => any;
//   footer?: (props: any) => any;
// };

// type ColumnGroup<T> = {
//   header?: string;
//   columns: Array<Column<T>>;
//   footer?: (props: any) => any;
// };

export const emptyVendor: FinVendorEtl = {
  id: 0,
  vendor_Code: "",
  currency: "",
  tax_Authority: "",
  ext_Ref_Vendor_Id: "",
  last_Name: "",
  first_Name: "",
  salutation: "",
  address1: "",
  address2: "",
  address3: "",
  address4: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  phone_Number_1: "",
  phone_Number_2: "",
  phone_Number_3: "",
  phone_Number_4: "",
  phone_Number_5: "",
  phone_Number_6: "",
  phone_Number_7: "",
  phone_Number_8: "",
  phone_Number_9: "",
  phone_Number_10: "",
  government_ID: "",
  government_Name: "",
  email: "",
  alternate_Email: "",
  workers_Comp_Expiration_Date: "",
  liability_Expiration_Date: "",
  contact: "",
  is_Contractor: "",
  is_InActive: "",
  inActive_Date: "",
  is_Require_Contract: "",
  user_Defined_Field1: "",
  user_Defined_Field2: "",
  user_Defined_Field3: "",
  user_Defined_Field4: "",
  user_Defined_Field5: "",
  user_Defined_Field6: "",
  user_Defined_Field7: "",
  user_Defined_Field8: "",
  user_Defined_Field9: "",
  user_Defined_Field10: "",
  user_Defined_Field11: "",
  user_Defined_Field12: "",
  gets: "",
  usual_Account_Code: "",
  default_AP_Account: "",
  default_Cash_Account: "",
  sales_Tax: "",
  tax_Registered: "",
  tax_Registration_Number: "",
  domestic_Tax_Tran_Type: "",
  cross_Border_Tax_Tran_Type: "",
  tax_Point: "",
  pST_Exempt: "",
  notes: "",
  consolidate: "",
  cheque_Memo_From_Invoice: "",
  hold_Payments: "",
  eFT: "",
  no_Signature: "",
  on_Cheques_Over: "",
  memo: "",
  pO_Required: "",
  discount_Percent: "",
  discount_Day: "",
  payment_Terms: "",
  days_From_Invoice_Or_Month: "",
  employee: "",
  vendor_Priority: "",
  language: "",
  tag: "",
  vendor_Status: "",
  expense_Type: "",
  priority: "",
  prop_Prompt: "",
  no_Duplicate_Invoice_on_Same_Date: "",
  // set other properties to empty strings
};
