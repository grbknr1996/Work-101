enum IpTypes {
  TRADEMARK = 'trademark',
  PATENT = 'patent',
  COPYRIGHT = 'copyright',
  POST_FILINGS = 'post filings',
  INDUSTRIAL_DESIGN = 'industrial design',
  GEOGRAPHICAL_INDICATIONS = 'geographical indications',
}

export interface JournalPublication {
  journalName: string,
  journalCode: string,
  templateName: string,
  category: `${IpTypes}`,
  status: string,
  gazetteDate: string,
  files: {fileId: string}[],
  actions: string[]
}

export interface PendingPublication {
  publicationName: string,
  fileId: string,
  category: `${IpTypes}`,
  templateName: string,
  lastAction: string,
  lastActionDate: string,
  lastResponsibleUser: string,
  status: string,
  ageDays: number
}