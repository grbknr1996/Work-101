enum IpTypes {
  TRADEMARK = 'trademark',
  PATENT = 'patent',
  COPYRIGHT = 'copyright',
  POST_FILINGS = 'post filings',
  INDUSTRIAL_DESIGN = 'industrial design',
  GEOGRAPHICAL_INDICATIONS = 'geographical indications',
}

export interface JournalPublication {
    journalCode: string,
    name: string,
    category: `${IpTypes}`,
    status: string,
    creationDate: string,
    publicationDate: string,
    files: number
}