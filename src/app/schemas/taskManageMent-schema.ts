export interface CategoryStats {
  processName: string;
  total: number;
  pending: number;
  avgAge: number;
}

export interface ProcessSummary {
  id: string;
  processName: string;
  processType: string;
  assignedTasks: number;
  unassignedTasks: number;
  averageAge: number;
  status: string;
  responsibleGroup?: string;
}

export interface UserUnits {
    id: string;
    unitName: string;
}

export interface UnitWithMembers extends UserUnits {
  members: UnitMembers[];
}


export interface UnitMembers {
  id: string;
  name: string;
  status: string;
  assignedTasks: number;
  workMode: string;
  projectedTasks?: number;
  totalAfter?: number;
}

export interface TasksDetails {
  documentId: string;
  description: string;
  receivedOn: string;
  lastAction: string;
  age: string;
  daysOverDue: number;
  lastResponsibleUser: string;
  assignedUser: string;
  assignedUnit: string;
}

export interface ProcessWithTasks {
  id: string;
  processName: string;
  status: string;
  assignedTasks: number;
  unassignedTasks: number;
  tasks: TasksDetails[];
}

/////////// bibliographicdata //////

export interface Registration {
  registrationNbr: string;
  registrationDate: string;
  entitlementDate: string;
  expirationDate: string;
  expectedRenewalDate: string;
}

export interface FilingData {
  fileId: string;
  filingDate: string;
  applicationType: string;
  applicationSubtype: string;
  receptionUser: string;
  receptionDate: string;
  externalOfficeCode: string;
  externalOfficeFilingDate: string;
  externalSystemId: string;
  validationUser: string;
  validationDate: string;
  locked: boolean;
}

export interface Owner {
  personName: string;
  addressStreet: string;
  cityName: string;
  zipCode: string;
  stateName: string;
  residenceCountryName: string;
  residenceCountryCode: string;
}

export interface Representative extends Owner {}

export interface Priority {
  countryCode: string;
  priorityNumber: string;
  priorityDate: string;
  priorityStatus: string;
}

export interface NiceClass {
  niceClassNbr: string;
  niceClassDescription: string;
  niceClassEdition: string;
  niceClassVersion: string;
  niceClassDetailedStatus: string;
}

export interface ViennaClass {
  viennaCategory: string;
  viennaDivision: string;
  viennaSection: string;
  viennaVersion: string;
}

export interface BibliographicData {
  registration: Registration;
  filingData: FilingData;
  owners: Owner[];
  representatives: Representative[];
  priority: Priority[];
  niceClasses: NiceClass[];
  viennaClasses: ViennaClass[];
  notes: string;
}

