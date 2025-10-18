enum IpTypes {
  TRADEMARK = 'trademark',
  PATENT = 'patent',
  COPYRIGHT = 'copyright',
  POST_FILINGS = 'post filings',
  INDUSTRIAL_DESIGN = 'industrial design',
  GEOGRAPHICAL_INDICATIONS = 'geographical indications',
}

export interface Fee {
  name: string,
  category: `${IpTypes}`,
  basicFee: number,
  variableFee: number,
  checked?: boolean
}

export type FeeConditions = {
  platformCode?: string,
  currencyCode: string,
  feePayableTotalAmount: number,
  feePayableTotalGrossAmount: number,
  feePayableTotalDiscountAmount: number,
  feePayableTotalTaxAmount: number,
  feeCalculationDate: string,
  requestBag: RequestBag[]
}

type RequestBag = {
  documentOriginCode: string,
  responseFeeCount: number,
  feeBag: FeeBag[]
}

export type FeeBag = {
  feeId: string,
  feeCategory: string,
  feeTypeCode: string,
  feeDescription: string,
  applicablePeriod?: string,
  basicFeeUnitAmount: number,
  basicFeeUnitQuantity: number,
  additionalFeeUnitAmount: number,
  additionalFeeUnitQuantity: number,
  taxInclusionFeeIndicator: boolean,
  globalTaxExclusionIndicator: boolean,
  feePayableTotalAmount: number,
  feePayableTotalGrossAmount: number,
  feePayableTotalDiscountAmount: number,
  feePayableTotalTaxAmount: number,
  userDocumentCode?: string,
  userDocumentCodeName?: string,
  userDocumentType?: string,
  userDocumentTypeName?: string
  ipRightCategoryCode?: string,
  ipRightCategory?: string,
  fileType?: string,
  fileTypeName?: string,
  applicationCategoryCode?: string,
  applicationCategory?: string,
  applicationSubCategoryCode?: string,
  applicationSubCategory?: string,
  documentOriginCode: string,
  documentOriginName: string,
  taxBag?: TaxBag[],
  discountBag?: DiscountBag[]
}

type TaxBag = {
  taxId: string,
  taxDescription: string,
  taxAmount: number,
  taxMinimumAmount: number,
  taxPercentage: number
}

type DiscountBag = {
  discountScheme: {
    discountCategory: string | null,
    discountDescription: string | null,
    documentCode: string | null
  },
  discountAmount: number,
  discountPercentage: string | null
}

export type DocumentOrigins = {
  // id: string,
  // map: {
  //   [key: string]: string
  // } 
  documentOriginCode: string,
  documentOriginName: string,
  allowReceptionIndicator: boolean,
  backfileIndicator: boolean,
  efilingIndicator: boolean
}
