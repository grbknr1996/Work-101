import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BibliographicData, CategoryStats, ProcessSummary, ProcessWithTasks, UnitWithMembers} from '../schemas/taskManageMent-schema';

export interface UserQueryParams {
  loginId?: string;
  userEmail?: string;
  isActive?: boolean;
  exactMatchIndicator?: boolean;
  limit?: number;
  offset?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  wipoPlatformCode?: string;
}

const mockProcesses: ProcessSummary[] = [
  // Industrial Designs processes
  {
    id: 'id_examination',
    processName: 'Industrial Designs',
    processType: 'Industrial Designs',
    assignedTasks: 34,
    unassignedTasks: 18,
    averageAge: 7.2,
    status: 'Examination',
    responsibleGroup: 'Group A'
  },
  {
    id: 'id_granted',
    processName: 'Industrial Designs',
    processType: 'Industrial Designs',
    assignedTasks: 23,
    unassignedTasks: 12,
    averageAge: 5.8,
    status: 'Granted',
    responsibleGroup: 'Group B'
  },
  {
    id: 'id_in_publication',
    processName: 'Industrial Designs',
    processType: 'Industrial Designs',
    assignedTasks: 45,
    unassignedTasks: 25,
    averageAge: 4.3,
    status: 'In Publication',
    responsibleGroup: 'Group C'
  },
  {
    id: 'id_published',
    processName: 'Industrial Designs',
    processType: 'Industrial Designs',
    assignedTasks: 67,
    unassignedTasks: 31,
    averageAge: 3.1,
    status: 'Published',
    responsibleGroup: 'Group D'
  },
  // Patent processes
  {
    id: 'pa_examination',
    processName: 'Patents',
    processType: 'Patents',
    assignedTasks: 89,
    unassignedTasks: 42,
    averageAge: 12.5,
    status: 'PA Examination'
  },
  {
    id: 'pa_migrated',
    processName: 'Patents',
    processType: 'Patents',
    assignedTasks: 56,
    unassignedTasks: 28,
    averageAge: 9.7,
    status: 'PA Migrated'
  },
  {
    id: 'pa_received',
    processName: 'Patents',
    processType: 'Patents',
    assignedTasks: 123,
    unassignedTasks: 67,
    averageAge: 6.4,
    status: 'PA Received'
  },
  {
    id: 'pa_patent_refused',
    processName: 'Patents',
    processType: 'Patents',
    assignedTasks: 34,
    unassignedTasks: 15,
    averageAge: 15.8,
    status: 'PA Patent Refused'
  },
  // Trademark processes
  {
    id: 'tm_payment_invitation',
    processName: 'Trademarks',
    processType: 'Trademarks',
    assignedTasks: 78,
    unassignedTasks: 41,
    averageAge: 8.9,
    status: 'Payment Invitation Sent'
  },
  {
    id: 'tm_abandoned',
    processName: 'Trademarks',
    processType: 'Trademarks',
    assignedTasks: 23,
    unassignedTasks: 11,
    averageAge: 22.3,
    status: 'TM Abandoned'
  },
  {
    id: 'tm_examination',
    processName: 'Trademarks',
    processType: 'Trademarks',
    assignedTasks: 156,
    unassignedTasks: 73,
    averageAge: 11.2,
    status: 'TM Examination'
  },
  {
    id: 'tm_formality_check',
    processName: 'Trademarks',
    processType: 'Trademarks',
    assignedTasks: 92,
    unassignedTasks: 48,
    averageAge: 5.7,
    status: 'TM Formality Check'
  },
  // Other IP Registrations processes
  {
    id: 'oip_examination',
    processName: 'Other IP Registrations',
    processType: 'Other IP Registrations',
    assignedTasks: 45,
    unassignedTasks: 23,
    averageAge: 9.1,
    status: 'OIP Examination'
  },
  {
    id: 'oip_granted',
    processName: 'Other IP Registrations',
    processType: 'Other IP Registrations',
    assignedTasks: 32,
    unassignedTasks: 16,
    averageAge: 7.5,
    status: 'OIP Granted'
  },
  {
    id: 'oip_registration',
    processName: 'Other IP Registrations',
    processType: 'Other IP Registrations',
    assignedTasks: 28,
    unassignedTasks: 14,
    averageAge: 12.3,
    status: 'OIP Registration'
  },
  // Post-filing processes
  {
    id: 'pf_renewal',
    processName: 'Post-filing',
    processType: 'Post-filing',
    assignedTasks: 67,
    unassignedTasks: 34,
    averageAge: 6.8,
    status: 'PF Renewal'
  },
  {
    id: 'pf_amendment',
    processName: 'Post-filing',
    processType: 'Post-filing',
    assignedTasks: 43,
    unassignedTasks: 22,
    averageAge: 8.2,
    status: 'PF Amendment'
  },
  {
    id: 'pf_transfer',
    processName: 'Post-filing',
    processType: 'Post-filing',
    assignedTasks: 29,
    unassignedTasks: 15,
    averageAge: 5.4,
    status: 'PF Transfer'
  },
  // Office Documents processes
  {
    id: 'od_acknowledged',
    processName: 'Office Documents',
    processType: 'Office Documents',
    assignedTasks: 45,
    unassignedTasks: 23,
    averageAge: 6.8,
    status: 'OD Acknowledged'
  },
  {
    id: 'od_authorised',
    processName: 'Office Documents',
    processType: 'Office Documents',
    assignedTasks: 32,
    unassignedTasks: 18,
    averageAge: 4.2,
    status: 'OD Authorised'
  },
  {
    id: 'od_awaiting_notification',
    processName: 'Office Documents',
    processType: 'Office Documents',
    assignedTasks: 28,
    unassignedTasks: 15,
    averageAge: 7.5,
    status: 'OD Awaiting Notification'
  }
];

const mockUnitsMembersData: UnitWithMembers[] = [
  {
    id: "unit-1",
    unitName: "Unit 1",
    members: [
      { id: "m-1-1", name: "Alice Johnson", status: "active", assignedTasks: 7, workMode: "full -time" },
      { id: "m-1-2", name: "Bob Smith", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-1-3", name: "Charlie Brown", status: "active", assignedTasks: 3, workMode: "part-time" },
      { id: "m-1-4", name: "Diana Prince", status: "active", assignedTasks: 9, workMode: "full -time" },
      { id: "m-1-5", name: "Ethan Hunt", status: "active", assignedTasks: 5, workMode: "full -time" },
      { id: "m-1-6", name: "Fiona Davis", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-1-7", name: "George Wilson", status: "active", assignedTasks: 4, workMode: "full -time" },
      { id: "m-1-8", name: "Hannah Lee", status: "active", assignedTasks: 6, workMode: "full -time" },
    ],
  },
  {
    id: "unit-2",
    unitName: "Unit 2",
    members: [
      { id: "m-2-1", name: "Ian Scott", status: "active", assignedTasks: 8, workMode: "full -time" },
      { id: "m-2-2", name: "Jane Foster", status: "active", assignedTasks: 2, workMode: "part-time" },
      { id: "m-2-3", name: "Kevin Turner", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-2-4", name: "Laura Palmer", status: "active", assignedTasks: 5, workMode: "full -time" },
      { id: "m-2-5", name: "Mark Evans", status: "active", assignedTasks: 10, workMode: "full -time" },
      { id: "m-2-6", name: "Nina Brooks", status: "active", assignedTasks: 3, workMode: "part-time" },
      { id: "m-2-7", name: "Oscar Wright", status: "active", assignedTasks: 7, workMode: "full -time" },
      { id: "m-2-8", name: "Paula Adams", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-2-9", name: "Quincy Jones", status: "active", assignedTasks: 4, workMode: "full -time" },
    ],
  },
  {
    id: "unit-3",
    unitName: "Unit 3",
    members: [
      { id: "m-3-1", name: "Rachel Green", status: "active", assignedTasks: 6, workMode: "full -time" },
      { id: "m-3-2", name: "Sam Carter", status: "active", assignedTasks: 8, workMode: "full -time" },
      { id: "m-3-3", name: "Tom Hardy", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-3-4", name: "Uma Thurman", status: "active", assignedTasks: 9, workMode: "full -time" },
      { id: "m-3-5", name: "Victor Stone", status: "active", assignedTasks: 2, workMode: "part-time" },
      { id: "m-3-6", name: "Wendy Morris", status: "active", assignedTasks: 7, workMode: "full -time" },
      { id: "m-3-7", name: "Xavier Lopez", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-3-8", name: "Yvonne Taylor", status: "active", assignedTasks: 5, workMode: "full -time" },
      { id: "m-3-9", name: "Zack Martin", status: "active", assignedTasks: 4, workMode: "full -time" },
    ],
  },
  {
    id: "unit-4",
    unitName: "Unit 4",
    members: [
      { id: "m-4-1", name: "Aaron Paul", status: "active", assignedTasks: 10, workMode: "full -time" },
      { id: "m-4-2", name: "Bella Swan", status: "active", assignedTasks: 6, workMode: "part-time" },
      { id: "m-4-3", name: "Chris Evans", status: "active", assignedTasks: 9, workMode: "full -time" },
      { id: "m-4-4", name: "Derek Hale", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-4-5", name: "Elena Gilbert", status: "active", assignedTasks: 7, workMode: "full -time" },
      { id: "m-4-6", name: "Finn Wolf", status: "active", assignedTasks: 5, workMode: "full -time" },
      { id: "m-4-7", name: "Gina Torres", status: "active", assignedTasks: 8, workMode: "full -time" },
      { id: "m-4-8", name: "Harry Potter", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-4-9", name: "Isla Fisher", status: "active", assignedTasks: 3, workMode: "full -time" },
      { id: "m-4-10", name: "Jack Ryan", status: "active", assignedTasks: 6, workMode: "full -time" },
    ],
  },
  {
    id: "unit-5",
    unitName: "Unit 5",
    members: [
      { id: "m-5-1", name: "Kate Winslet", status: "active", assignedTasks: 4, workMode: "full -time" },
      { id: "m-5-2", name: "Leo DiCaprio", status: "active", assignedTasks: 9, workMode: "full -time" },
      { id: "m-5-3", name: "Mia Wallace", status: "active", assignedTasks: 2, workMode: "part-time" },
      { id: "m-5-4", name: "Noah Centineo", status: "active", assignedTasks: 7, workMode: "full -time" },
      { id: "m-5-5", name: "Olivia Wilde", status: "active", assignedTasks: 8, workMode: "full -time" },
      { id: "m-5-6", name: "Peter Parker", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-5-7", name: "Quinn Hughes", status: "active", assignedTasks: 6, workMode: "full -time" },
      { id: "m-5-8", name: "Rose Tyler", status: "active", assignedTasks: 5, workMode: "full -time" },
      { id: "m-5-9", name: "Steve Rogers", status: "active", assignedTasks: 11, workMode: "full -time" },
      { id: "m-5-10", name: "Tony Stark", status: "active", assignedTasks: 12, workMode: "full -time" },
      { id: "m-5-11", name: "Ursula Lane", status: "Inactive", assignedTasks: 0, workMode: "part-time" },
      { id: "m-5-12", name: "Vince Gill", status: "active", assignedTasks: 3, workMode: "part-time" },
    ],
  },
];

const mockTasksDetails: ProcessWithTasks[] = 
[
  {
    "id": "id_examination",
    "processName": "Industrial Designs",
    "status": "Examination",
    "assignedTasks": 34,
    "unassignedTasks": 18,
    "tasks": [
      {
        "documentId": "DOC-2024-1000",
        "description": "Change of Name",
        "receivedOn": "2025-08-16",
        "lastAction": "UDA Request Abandonment",
        "age": "9",
        "daysOverDue": 0,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1001",
        "description": "To Publication",
        "receivedOn": "2025-08-20",
        "lastAction": "UDA Request Abandonment",
        "age": "5",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1002",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-20",
        "lastAction": "DocumentAcceptence",
        "age": "5",
        "daysOverDue": 1,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1003",
        "description": "Change of Address",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1004",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 1,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1005",
        "description": "Change of Address",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 2,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1006",
        "description": "Change of Address",
        "receivedOn": "2025-08-19",
        "lastAction": "Document Acceptance",
        "age": "6",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1007",
        "description": "Grant",
        "receivedOn": "2025-08-10",
        "lastAction": "DocumentAcceptence",
        "age": "15",
        "daysOverDue": 2,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1008",
        "description": "Grant",
        "receivedOn": "2025-08-15",
        "lastAction": "UDA Request Abandonment",
        "age": "10",
        "daysOverDue": 3,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1009",
        "description": "Acknowledge",
        "receivedOn": "2025-08-20",
        "lastAction": "Document Acceptance",
        "age": "5",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "id_granted",
    "processName": "Industrial Designs",
    "status": "Granted",
    "assignedTasks": 23,
    "unassignedTasks": 12,
    "tasks": [
      {
        "documentId": "DOC-2024-1010",
        "description": "Change of Name",
        "receivedOn": "2025-08-23",
        "lastAction": "Document Acceptance",
        "age": "2",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1011",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1012",
        "description": "Change of Address",
        "receivedOn": "2025-08-22",
        "lastAction": "DocumentAcceptence",
        "age": "3",
        "daysOverDue": 1,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1013",
        "description": "Delay is Over",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 1,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1014",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-17",
        "lastAction": "DocumentAcceptence",
        "age": "8",
        "daysOverDue": 4,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1015",
        "description": "Examination Start",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 4,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1016",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-20",
        "lastAction": "DocumentAcceptence",
        "age": "5",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1017",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1018",
        "description": "Change of Name",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1019",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 3,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "id_in_publication",
    "processName": "Industrial Designs",
    "status": "In Publication",
    "assignedTasks": 45,
    "unassignedTasks": 25,
    "tasks": [
      {
        "documentId": "DOC-2024-1020",
        "description": "Acknowledge",
        "receivedOn": "2025-08-14",
        "lastAction": "UDA Request Abandonment",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1021",
        "description": "Examination Start",
        "receivedOn": "2025-08-14",
        "lastAction": "UDA Request Abandonment",
        "age": "11",
        "daysOverDue": 1,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1022",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 0,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1023",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-12",
        "lastAction": "UDA Request Abandonment",
        "age": "13",
        "daysOverDue": 3,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1024",
        "description": "To Publication",
        "receivedOn": "2025-08-11",
        "lastAction": "Document Acceptance",
        "age": "14",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1025",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-10",
        "lastAction": "Document Acceptance",
        "age": "15",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1026",
        "description": "Examination Start",
        "receivedOn": "2025-08-21",
        "lastAction": "UDA Request Abandonment",
        "age": "4",
        "daysOverDue": 1,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1027",
        "description": "TM Registration",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 1,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1028",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-21",
        "lastAction": "DocumentAcceptence",
        "age": "4",
        "daysOverDue": 3,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1029",
        "description": "TM Registration",
        "receivedOn": "2025-08-16",
        "lastAction": "UDA Request Abandonment",
        "age": "9",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "id_published",
    "processName": "Industrial Designs",
    "status": "Published",
    "assignedTasks": 67,
    "unassignedTasks": 31,
    "tasks": [
      {
        "documentId": "DOC-2024-1030",
        "description": "To Publication",
        "receivedOn": "2025-08-18",
        "lastAction": "Document Acceptance",
        "age": "7",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1031",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-14",
        "lastAction": "UDA Request Abandonment",
        "age": "11",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1032",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1033",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-18",
        "lastAction": "DocumentAcceptence",
        "age": "7",
        "daysOverDue": 3,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1034",
        "description": "Grant",
        "receivedOn": "2025-08-24",
        "lastAction": "Document Acceptance",
        "age": "1",
        "daysOverDue": 3,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1035",
        "description": "Change of Name",
        "receivedOn": "2025-08-11",
        "lastAction": "UDA Request Abandonment",
        "age": "14",
        "daysOverDue": 3,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1036",
        "description": "Delay is Over",
        "receivedOn": "2025-08-16",
        "lastAction": "UDA Request Abandonment",
        "age": "9",
        "daysOverDue": 3,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1037",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-23",
        "lastAction": "DocumentAcceptence",
        "age": "2",
        "daysOverDue": 1,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1038",
        "description": "Examination Start",
        "receivedOn": "2025-08-20",
        "lastAction": "Document Acceptance",
        "age": "5",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1039",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit B"
      }
    ]
  },
  {
    "id": "pa_examination",
    "processName": "Patents",
    "status": "PA Examination",
    "assignedTasks": 89,
    "unassignedTasks": 42,
    "tasks": [
      {
        "documentId": "DOC-2024-1040",
        "description": "To Publication",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 2,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1041",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-11",
        "lastAction": "UDA Request Abandonment",
        "age": "14",
        "daysOverDue": 0,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1042",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-22",
        "lastAction": "UDA Request Abandonment",
        "age": "3",
        "daysOverDue": 0,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1043",
        "description": "Change of Address",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 1,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1044",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-19",
        "lastAction": "Document Acceptance",
        "age": "6",
        "daysOverDue": 3,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1045",
        "description": "Acknowledge",
        "receivedOn": "2025-08-21",
        "lastAction": "DocumentAcceptence",
        "age": "4",
        "daysOverDue": 0,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1046",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 0,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1047",
        "description": "TM Registration",
        "receivedOn": "2025-08-20",
        "lastAction": "Document Acceptance",
        "age": "5",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1048",
        "description": "Change of Address",
        "receivedOn": "2025-08-23",
        "lastAction": "UDA Request Abandonment",
        "age": "2",
        "daysOverDue": 2,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1049",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 2,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2025-1049",
        "description": "change of Name and Address",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 2,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit A"
      }
    ]
  },
  {
    "id": "pa_migrated",
    "processName": "Patents",
    "status": "PA Migrated",
    "assignedTasks": 56,
    "unassignedTasks": 28,
    "tasks": [
      {
        "documentId": "DOC-2024-1050",
        "description": "Change of Name",
        "receivedOn": "2025-08-10",
        "lastAction": "DocumentAcceptence",
        "age": "15",
        "daysOverDue": 3,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1051",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 2,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1052",
        "description": "To Publication",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 0,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1053",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-15",
        "lastAction": "Document Acceptance",
        "age": "10",
        "daysOverDue": 1,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1054",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-22",
        "lastAction": "DocumentAcceptence",
        "age": "3",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1055",
        "description": "Examination Start",
        "receivedOn": "2025-08-18",
        "lastAction": "Document Acceptance",
        "age": "7",
        "daysOverDue": 3,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1056",
        "description": "TM Registration",
        "receivedOn": "2025-08-10",
        "lastAction": "DocumentAcceptence",
        "age": "15",
        "daysOverDue": 0,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1057",
        "description": "Delay is Over",
        "receivedOn": "2025-08-10",
        "lastAction": "Document Acceptance",
        "age": "15",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1058",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-16",
        "lastAction": "UDA Request Abandonment",
        "age": "9",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1059",
        "description": "TM Registration",
        "receivedOn": "2025-08-19",
        "lastAction": "UDA Request Abandonment",
        "age": "6",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "pa_received",
    "processName": "Patents",
    "status": "PA Received",
    "assignedTasks": 123,
    "unassignedTasks": 67,
    "tasks": [
      {
        "documentId": "DOC-2024-1060",
        "description": "To Publication",
        "receivedOn": "2025-08-16",
        "lastAction": "UDA Request Abandonment",
        "age": "9",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1061",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-11",
        "lastAction": "Document Acceptance",
        "age": "14",
        "daysOverDue": 4,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1062",
        "description": "Grant",
        "receivedOn": "2025-08-21",
        "lastAction": "DocumentAcceptence",
        "age": "4",
        "daysOverDue": 4,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1063",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1064",
        "description": "TM Registration",
        "receivedOn": "2025-08-21",
        "lastAction": "Document Acceptance",
        "age": "4",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1065",
        "description": "Change of Name",
        "receivedOn": "2025-08-16",
        "lastAction": "UDA Request Abandonment",
        "age": "9",
        "daysOverDue": 4,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1066",
        "description": "Change of Name",
        "receivedOn": "2025-08-23",
        "lastAction": "UDA Request Abandonment",
        "age": "2",
        "daysOverDue": 4,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1067",
        "description": "Acknowledge",
        "receivedOn": "2025-08-16",
        "lastAction": "Document Acceptance",
        "age": "9",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1068",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-22",
        "lastAction": "DocumentAcceptence",
        "age": "3",
        "daysOverDue": 2,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1069",
        "description": "Acknowledge",
        "receivedOn": "2025-08-23",
        "lastAction": "Document Acceptance",
        "age": "2",
        "daysOverDue": 3,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      }
    ]
  },
  {
    "id": "pa_patent_refused",
    "processName": "Patents",
    "status": "PA Patent Refused",
    "assignedTasks": 34,
    "unassignedTasks": 15,
    "tasks": [
      {
        "documentId": "DOC-2024-1070",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1071",
        "description": "To Publication",
        "receivedOn": "2025-08-10",
        "lastAction": "DocumentAcceptence",
        "age": "15",
        "daysOverDue": 3,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1072",
        "description": "Delay is Over",
        "receivedOn": "2025-08-10",
        "lastAction": "UDA Request Abandonment",
        "age": "15",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1073",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 2,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1074",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 1,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1075",
        "description": "Acknowledge",
        "receivedOn": "2025-08-11",
        "lastAction": "UDA Request Abandonment",
        "age": "14",
        "daysOverDue": 4,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1076",
        "description": "Grant",
        "receivedOn": "2025-08-11",
        "lastAction": "Document Acceptance",
        "age": "14",
        "daysOverDue": 1,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1077",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-16",
        "lastAction": "Document Acceptance",
        "age": "9",
        "daysOverDue": 3,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1078",
        "description": "Delay is Over",
        "receivedOn": "2025-08-18",
        "lastAction": "UDA Request Abandonment",
        "age": "7",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1079",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "tm_payment_invitation",
    "processName": "Trademarks",
    "status": "Payment Invitation Sent",
    "assignedTasks": 78,
    "unassignedTasks": 41,
    "tasks": [
      {
        "documentId": "DOC-2024-1080",
        "description": "TM Registration",
        "receivedOn": "2025-08-18",
        "lastAction": "Document Acceptance",
        "age": "7",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1081",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-13",
        "lastAction": "Document Acceptance",
        "age": "12",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1082",
        "description": "Examination Start",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 1,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1083",
        "description": "To Publication",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1084",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-10",
        "lastAction": "UDA Request Abandonment",
        "age": "15",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1085",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-10",
        "lastAction": "DocumentAcceptence",
        "age": "15",
        "daysOverDue": 1,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1086",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-20",
        "lastAction": "DocumentAcceptence",
        "age": "5",
        "daysOverDue": 2,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1087",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1088",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-19",
        "lastAction": "Document Acceptance",
        "age": "6",
        "daysOverDue": 1,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1089",
        "description": "To Publication",
        "receivedOn": "2025-08-23",
        "lastAction": "UDA Request Abandonment",
        "age": "2",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "tm_abandoned",
    "processName": "Trademarks",
    "status": "TM Abandoned",
    "assignedTasks": 23,
    "unassignedTasks": 11,
    "tasks": [
      {
        "documentId": "DOC-2024-1090",
        "description": "Grant",
        "receivedOn": "2025-08-23",
        "lastAction": "UDA Request Abandonment",
        "age": "2",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1091",
        "description": "Change of Address",
        "receivedOn": "2025-08-10",
        "lastAction": "Document Acceptance",
        "age": "15",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1092",
        "description": "Grant",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1093",
        "description": "TM Registration",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 4,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1094",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-21",
        "lastAction": "UDA Request Abandonment",
        "age": "4",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1095",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-18",
        "lastAction": "Document Acceptance",
        "age": "7",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1096",
        "description": "Grant",
        "receivedOn": "2025-08-21",
        "lastAction": "UDA Request Abandonment",
        "age": "4",
        "daysOverDue": 4,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1097",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-14",
        "lastAction": "DocumentAcceptence",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1098",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-16",
        "lastAction": "Document Acceptance",
        "age": "9",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1099",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-18",
        "lastAction": "UDA Request Abandonment",
        "age": "7",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "tm_examination",
    "processName": "Trademarks",
    "status": "TM Examination",
    "assignedTasks": 156,
    "unassignedTasks": 73,
    "tasks": [
      {
        "documentId": "DOC-2024-1100",
        "description": "Grant",
        "receivedOn": "2025-08-20",
        "lastAction": "DocumentAcceptence",
        "age": "5",
        "daysOverDue": 2,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1101",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-24",
        "lastAction": "Document Acceptance",
        "age": "1",
        "daysOverDue": 2,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1102",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-15",
        "lastAction": "Document Acceptance",
        "age": "10",
        "daysOverDue": 1,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1103",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 0,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1104",
        "description": "To Publication",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 1,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1105",
        "description": "Delay is Over",
        "receivedOn": "2025-08-13",
        "lastAction": "DocumentAcceptence",
        "age": "12",
        "daysOverDue": 0,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1106",
        "description": "Grant",
        "receivedOn": "2025-08-23",
        "lastAction": "Document Acceptance",
        "age": "2",
        "daysOverDue": 1,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1107",
        "description": "Change of Address",
        "receivedOn": "2025-08-10",
        "lastAction": "Document Acceptance",
        "age": "15",
        "daysOverDue": 2,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1108",
        "description": "Grant",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 0,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1109",
        "description": "Grant",
        "receivedOn": "2025-08-20",
        "lastAction": "UDA Request Abandonment",
        "age": "5",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "tm_formality_check",
    "processName": "Trademarks",
    "status": "TM Formality Check",
    "assignedTasks": 92,
    "unassignedTasks": 48,
    "tasks": [
      {
        "documentId": "DOC-2024-1110",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 4,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1111",
        "description": "To Publication",
        "receivedOn": "2025-08-21",
        "lastAction": "Document Acceptance",
        "age": "4",
        "daysOverDue": 0,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1112",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1113",
        "description": "Delay is Over",
        "receivedOn": "2025-08-18",
        "lastAction": "DocumentAcceptence",
        "age": "7",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1114",
        "description": "Delay is Over",
        "receivedOn": "2025-08-12",
        "lastAction": "UDA Request Abandonment",
        "age": "13",
        "daysOverDue": 3,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1115",
        "description": "Change of Address",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 0,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1116",
        "description": "Delay is Over",
        "receivedOn": "2025-08-24",
        "lastAction": "Document Acceptance",
        "age": "1",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1117",
        "description": "TM Registration",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1118",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-23",
        "lastAction": "UDA Request Abandonment",
        "age": "2",
        "daysOverDue": 2,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "oip_examination",
    "processName": "Other IP Registrations",
    "status": "OIP Examination",
    "assignedTasks": 45,
    "unassignedTasks": 23,
    "tasks": [
      {
        "documentId": "DOC-2024-1119",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-13",
        "lastAction": "DocumentAcceptence",
        "age": "12",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Sarah Johnson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1120",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-12",
        "lastAction": "Document Acceptance",
        "age": "13",
        "daysOverDue": 1,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1121",
        "description": "Delay is Over",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1122",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-21",
        "lastAction": "UDA Request Abandonment",
        "age": "4",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1123",
        "description": "Acknowledge",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1124",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-19",
        "lastAction": "DocumentAcceptence",
        "age": "6",
        "daysOverDue": 4,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1125",
        "description": "To Publication",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 4,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1126",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 4,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1127",
        "description": "Delay is Over",
        "receivedOn": "2025-08-19",
        "lastAction": "DocumentAcceptence",
        "age": "6",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit A"
      }
    ]
  },
  {
    "id": "oip_granted",
    "processName": "Other IP Registrations",
    "status": "OIP Granted",
    "assignedTasks": 32,
    "unassignedTasks": 16,
    "tasks": [
      {
        "documentId": "DOC-2024-1128",
        "description": "Change of Address",
        "receivedOn": "2025-08-15",
        "lastAction": "Document Acceptance",
        "age": "10",
        "daysOverDue": 3,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1129",
        "description": "Change of Name",
        "receivedOn": "2025-08-21",
        "lastAction": "DocumentAcceptence",
        "age": "4",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1130",
        "description": "Acknowledge",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 1,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1131",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-24",
        "lastAction": "Document Acceptance",
        "age": "1",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1132",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-14",
        "lastAction": "DocumentAcceptence",
        "age": "11",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1133",
        "description": "TM Registration",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 0,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1134",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-24",
        "lastAction": "DocumentAcceptence",
        "age": "1",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1135",
        "description": "Change of Address",
        "receivedOn": "2025-08-20",
        "lastAction": "DocumentAcceptence",
        "age": "5",
        "daysOverDue": 4,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1136",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-20",
        "lastAction": "UDA Request Abandonment",
        "age": "5",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit C"
      }
    ]
  },
  {
    "id": "oip_registration",
    "processName": "Other IP Registrations",
    "status": "OIP Registration",
    "assignedTasks": 28,
    "unassignedTasks": 14,
    "tasks": [
      {
        "documentId": "DOC-2024-1137",
        "description": "Change of Name",
        "receivedOn": "2025-08-10",
        "lastAction": "UDA Request Abandonment",
        "age": "15",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1138",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-11",
        "lastAction": "UDA Request Abandonment",
        "age": "14",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1139",
        "description": "Examination Start",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1140",
        "description": "Acknowledge",
        "receivedOn": "2025-08-22",
        "lastAction": "DocumentAcceptence",
        "age": "3",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1141",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-18",
        "lastAction": "UDA Request Abandonment",
        "age": "7",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1142",
        "description": "Delay is Over",
        "receivedOn": "2025-08-21",
        "lastAction": "Document Acceptance",
        "age": "4",
        "daysOverDue": 0,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1143",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-22",
        "lastAction": "DocumentAcceptence",
        "age": "3",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1144",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1145",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-23",
        "lastAction": "Document Acceptance",
        "age": "2",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "pf_renewal",
    "processName": "Post-filing",
    "status": "PF Renewal",
    "assignedTasks": 67,
    "unassignedTasks": 34,
    "tasks": [
      {
        "documentId": "DOC-2024-1146",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-18",
        "lastAction": "DocumentAcceptence",
        "age": "7",
        "daysOverDue": 3,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1147",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 2,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1148",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-12",
        "lastAction": "Document Acceptance",
        "age": "13",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1149",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-11",
        "lastAction": "UDA Request Abandonment",
        "age": "14",
        "daysOverDue": 0,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1150",
        "description": "Delay is Over",
        "receivedOn": "2025-08-21",
        "lastAction": "Document Acceptance",
        "age": "4",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1151",
        "description": "Change of Address",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 1,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1152",
        "description": "Change of Address",
        "receivedOn": "2025-08-13",
        "lastAction": "UDA Request Abandonment",
        "age": "12",
        "daysOverDue": 4,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1153",
        "description": "Change of Address",
        "receivedOn": "2025-08-23",
        "lastAction": "Document Acceptance",
        "age": "2",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1154",
        "description": "Grant",
        "receivedOn": "2025-08-20",
        "lastAction": "UDA Request Abandonment",
        "age": "5",
        "daysOverDue": 0,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "pf_amendment",
    "processName": "Post-filing",
    "status": "PF Amendment",
    "assignedTasks": 43,
    "unassignedTasks": 22,
    "tasks": [
      {
        "documentId": "DOC-2024-1155",
        "description": "Change of Name",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1156",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-15",
        "lastAction": "Document Acceptance",
        "age": "10",
        "daysOverDue": 1,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1157",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1158",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-12",
        "lastAction": "Document Acceptance",
        "age": "13",
        "daysOverDue": 1,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1159",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-17",
        "lastAction": "UDA Request Abandonment",
        "age": "8",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1160",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-12",
        "lastAction": "Document Acceptance",
        "age": "13",
        "daysOverDue": 4,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1161",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 3,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1162",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-17",
        "lastAction": "UDA Request Abandonment",
        "age": "8",
        "daysOverDue": 0,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1163",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-16",
        "lastAction": "Document Acceptance",
        "age": "9",
        "daysOverDue": 3,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "pf_transfer",
    "processName": "Post-filing",
    "status": "PF Transfer",
    "assignedTasks": 29,
    "unassignedTasks": 15,
    "tasks": [
      {
        "documentId": "DOC-2024-1164",
        "description": "Delay is Over",
        "receivedOn": "2025-08-10",
        "lastAction": "Document Acceptance",
        "age": "15",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1165",
        "description": "TM Registration",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 0,
        "lastResponsibleUser": "Sarah Johnson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1166",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-13",
        "lastAction": "Document Acceptance",
        "age": "12",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1167",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 2,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1168",
        "description": "Examination Start",
        "receivedOn": "2025-08-16",
        "lastAction": "Document Acceptance",
        "age": "9",
        "daysOverDue": 3,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1169",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-24",
        "lastAction": "DocumentAcceptence",
        "age": "1",
        "daysOverDue": 2,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1170",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-18",
        "lastAction": "UDA Request Abandonment",
        "age": "7",
        "daysOverDue": 1,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1171",
        "description": "Acknowledge",
        "receivedOn": "2025-08-14",
        "lastAction": "UDA Request Abandonment",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1172",
        "description": "Delay is Over",
        "receivedOn": "2025-08-24",
        "lastAction": "UDA Request Abandonment",
        "age": "1",
        "daysOverDue": 4,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "od_acknowledged",
    "processName": "Office Documents",
    "status": "OD Acknowledged",
    "assignedTasks": 45,
    "unassignedTasks": 23,
    "tasks": [
      {
        "documentId": "DOC-2024-1173",
        "description": "TM Publication Fees Paid",
        "receivedOn": "2025-08-19",
        "lastAction": "DocumentAcceptence",
        "age": "6",
        "daysOverDue": 2,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1174",
        "description": "Delay is Over",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1175",
        "description": "Delay is Over",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 2,
        "lastResponsibleUser": "Jane Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1176",
        "description": "Acknowledge",
        "receivedOn": "2025-08-11",
        "lastAction": "DocumentAcceptence",
        "age": "14",
        "daysOverDue": 2,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1177",
        "description": "App for Cancellation",
        "receivedOn": "2025-08-17",
        "lastAction": "DocumentAcceptence",
        "age": "8",
        "daysOverDue": 4,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1178",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-12",
        "lastAction": "DocumentAcceptence",
        "age": "13",
        "daysOverDue": 2,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Bob Williams",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1179",
        "description": "Grant",
        "receivedOn": "2025-08-11",
        "lastAction": "Document Acceptance",
        "age": "14",
        "daysOverDue": 3,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1180",
        "description": "Change of Name",
        "receivedOn": "2025-08-19",
        "lastAction": "Document Acceptance",
        "age": "6",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1181",
        "description": "Acknowledge",
        "receivedOn": "2025-08-18",
        "lastAction": "UDA Request Abandonment",
        "age": "7",
        "daysOverDue": 1,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Michael Smith",
        "assignedUnit": "Unit B"
      }
    ]
  },
  {
    "id": "od_authorised",
    "processName": "Office Documents",
    "status": "OD Authorised",
    "assignedTasks": 32,
    "unassignedTasks": 18,
    "tasks": [
      {
        "documentId": "DOC-2024-1182",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-18",
        "lastAction": "UDA Request Abandonment",
        "age": "7",
        "daysOverDue": 0,
        "lastResponsibleUser": "Anna Green",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1183",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-18",
        "lastAction": "Document Acceptance",
        "age": "7",
        "daysOverDue": 3,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1184",
        "description": "TM Registration",
        "receivedOn": "2025-08-16",
        "lastAction": "DocumentAcceptence",
        "age": "9",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Alice Brown",
        "assignedUnit": "Unit B"
      },
      {
        "documentId": "DOC-2024-1185",
        "description": "To Publication",
        "receivedOn": "2025-08-17",
        "lastAction": "Document Acceptance",
        "age": "8",
        "daysOverDue": 1,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Jane Doe",
        "assignedUnit": "Unit A"
      },
      {
        "documentId": "DOC-2024-1186",
        "description": "PA Acceptance",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 2,
        "lastResponsibleUser": "Tom Anderson",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1187",
        "description": "ID Change Status to",
        "receivedOn": "2025-08-21",
        "lastAction": "UDA Request Abandonment",
        "age": "4",
        "daysOverDue": 4,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1188",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-14",
        "lastAction": "DocumentAcceptence",
        "age": "11",
        "daysOverDue": 0,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1189",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-14",
        "lastAction": "Document Acceptance",
        "age": "11",
        "daysOverDue": 0,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "John Doe",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1190",
        "description": "PA Change Status to",
        "receivedOn": "2025-08-15",
        "lastAction": "DocumentAcceptence",
        "age": "10",
        "daysOverDue": 3,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      }
    ]
  },
  {
    "id": "od_awaiting_notification",
    "processName": "Office Documents",
    "status": "OD Awaiting Notification",
    "assignedTasks": 28,
    "unassignedTasks": 15,
    "tasks": [
      {
        "documentId": "DOC-2024-1191",
        "description": "Change of Name",
        "receivedOn": "2025-08-20",
        "lastAction": "Document Acceptance",
        "age": "5",
        "daysOverDue": 4,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1192",
        "description": "Examination Start",
        "receivedOn": "2025-08-15",
        "lastAction": "UDA Request Abandonment",
        "age": "10",
        "daysOverDue": 3,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1193",
        "description": "Examination Start",
        "receivedOn": "2025-08-22",
        "lastAction": "Document Acceptance",
        "age": "3",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1194",
        "description": "Examination Start",
        "receivedOn": "2025-08-24",
        "lastAction": "DocumentAcceptence",
        "age": "1",
        "daysOverDue": 4,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1195",
        "description": "Examination Start",
        "receivedOn": "2025-08-16",
        "lastAction": "Document Acceptance",
        "age": "9",
        "daysOverDue": 1,
        "lastResponsibleUser": "Bob Williams",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1196",
        "description": "Change of Address",
        "receivedOn": "2025-08-17",
        "lastAction": "UDA Request Abandonment",
        "age": "8",
        "daysOverDue": 1,
        "lastResponsibleUser": "John Doe",
        "assignedUser": "Tom Anderson",
        "assignedUnit": "Unit C"
      },
      {
        "documentId": "DOC-2024-1197",
        "description": "Change of Name",
        "receivedOn": "2025-08-11",
        "lastAction": "Document Acceptance",
        "age": "14",
        "daysOverDue": 2,
        "lastResponsibleUser": "Michael Smith",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1198",
        "description": "Delay is Over",
        "receivedOn": "2025-08-20",
        "lastAction": "UDA Request Abandonment",
        "age": "5",
        "daysOverDue": 0,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Unassigned",
        "assignedUnit": "Unassigned"
      },
      {
        "documentId": "DOC-2024-1199",
        "description": "TM Formality is OK",
        "receivedOn": "2025-08-14",
        "lastAction": "UDA Request Abandonment",
        "age": "11",
        "daysOverDue": 2,
        "lastResponsibleUser": "Alice Brown",
        "assignedUser": "Anna Green",
        "assignedUnit": "Unit C"
      }
    ]
  }
]

export const MOCK_BIBLIOGRAPHIC_DATA: BibliographicData = {
  registration: {
    registrationNbr: 'TR123456',
    registrationDate: '2021-06-15',
    entitlementDate: '2021-07-01',
    expirationDate: '2031-06-15',
    expectedRenewalDate: '2031-07-01'
  },
  filingData: {
    fileId: 'FILE-2021-001',
    filingDate: '2021-05-20',
    applicationType: 'Trademark',
    applicationSubtype: 'Wordmark',
    receptionUser: 'admin_user',
    receptionDate: '2021-05-21',
    externalOfficeCode: 'WIPO',
    externalOfficeFilingDate: '2021-05-25',
    externalSystemId: 'EXT-998877',
    validationUser: 'validator_user',
    validationDate: '2021-06-01',
    locked: false
  },
  owners: [
    {
      personName: 'ABC Corporation',
      addressStreet: '123 Main Street',
      cityName: 'New Delhi',
      zipCode: '110001',
      stateName: 'Delhi',
      residenceCountryName: 'India',
      residenceCountryCode: 'IN'
    }
  ],
  representatives: [
    {
      personName: 'XYZ Law Firm',
      addressStreet: '456 High Street',
      cityName: 'Mumbai',
      zipCode: '400001',
      stateName: 'Maharashtra',
      residenceCountryName: 'India',
      residenceCountryCode: 'IN'
    }
  ],
  priority: [
    {
      countryCode: 'US',
      priorityNumber: 'US987654',
      priorityDate: '2020-12-01',
      priorityStatus: 'Valid'
    },
    {
      countryCode: 'FR',
      priorityNumber: 'FR543210',
      priorityDate: '2021-01-10',
      priorityStatus: 'Pending'
    }
  ],
  niceClasses: [
    {
      niceClassNbr: '25',
      niceClassDescription: 'Clothing, footwear, headgear',
      niceClassEdition: '11',
      niceClassVersion: '2021',
      niceClassDetailedStatus: 'Active'
    },
    {
      niceClassNbr: '35',
      niceClassDescription: 'Advertising and business management',
      niceClassEdition: '11',
      niceClassVersion: '2021',
      niceClassDetailedStatus: 'Active'
    }
  ],
  viennaClasses: [
    {
      viennaCategory: '1',
      viennaDivision: '2',
      viennaSection: '3',
      viennaVersion: '2021'
    },
    {
      viennaCategory: '5',
      viennaDivision: '6',
      viennaSection: '7',
      viennaVersion: '2021'
    }
  ],
  notes: 'This is a mock bibliographic record used for demo purposes.'
};

@Injectable()
export class TaskManagementService {

    constructor(private http: HttpClient) { }

    getCategoryStats(): Promise<CategoryStats[]> {
    return Promise.resolve([
        { processName: 'Industrial Designs', total: 120, pending: 25, avgAge: 5 },
        { processName: 'Patents', total: 80, pending: 10, avgAge: 3 },
        { processName: 'Trademarks', total: 200, pending: 40, avgAge: 7 },
        { processName: 'Other IP Registrations', total: 60, pending: 5, avgAge: 2 },
        { processName: 'Post-filing', total: 95, pending: 15, avgAge: 4 },
        { processName: 'Office Documents', total: 150, pending: 20, avgAge: 6 }
    ]);
    }

    getProcessSummaries(): Promise<ProcessSummary[]> {

        return Promise.resolve(mockProcesses);
    }

    getUnitsWithMembers(): Promise<UnitWithMembers[]> {
        return Promise.resolve(mockUnitsMembersData);
    }

    getTasksByProcess(processId: string): Promise<ProcessWithTasks | undefined> {
        const process = mockTasksDetails.find(p => p.id === processId);
        return Promise.resolve(process);
    }

  //   async getProcessWithTasks(id: string): Promise<ProcessWithTasks | undefined> {
  //   const process = mockProcesses.find(p => p.id === id);        // ProcessSummary[]
  //   const tasksByStatus = mockTasksDetails.find(t => t.id === id); // TasksByStatus[]

  //   if (!process || !tasksByStatus) {
  //     return undefined;
  //   }

  //   return {
  //     id: process.id,
  //     processName: process.processName,
  //     status: process.status,
  //     assignedTasks: process.assignedTasks,
  //     unassignedTasks: process.unassignedTasks,
  //     tasks: tasksByStatus.tasks
  //   };
  // }

  async assignTasksToUser(userId: string, taskIds: string[]): Promise<any> {
    console.log('Assigning tasks', taskIds, 'to user', userId);
    const payload = { userId, taskIds };
    //return await this.http.post('/api/tasks/assign', payload).toPromise();
  }

  async unassignTasks(taskIds: string[]): Promise<any> {

    //return await this.http.post('/api/tasks/unassign', payload).toPromise();
  }

getMyTasks(): Promise<ProcessWithTasks[] | undefined> {
  const filtered = mockTasksDetails
    .map(process => ({
      ...process,
      tasks: process.tasks.filter(
        t => t.assignedUnit === 'Unit A' && t.assignedUser === 'Sarah Johnson'
      )
    }))
    .filter(process => process.tasks.length > 0);

  return Promise.resolve(filtered.length > 0 ? filtered : undefined);
}

  // taskManagement.service.ts (snippet)
async getDossierContent(taskId: string): Promise<string> {
  // TODO: call backend API
  return `Dossier content for ${taskId}...\n(Replace with real content from service)`;
}

async getTaskHistory(taskId: string): Promise<any[]> {
  // TODO: call backend API
  return [
    { timestamp: '2025-08-15 10:05', actor: 'User A', action: 'Assigned', note: 'Initial assignment' },
    { timestamp: '2025-08-20 14:42', actor: 'User B', action: 'Returned', note: 'Missing document' }
  ];
}

async recordAction(payload: { taskId: string; note: string; endOfWorkflow: boolean; nextUserId?: string | null }): Promise<any> {
  // TODO: POST to backend
  return { success: true };
}

async bulkApproveTasks(taskIds: string[]): Promise<any> {
  console.log('Bulk approving tasks', taskIds);
  const payload = { taskIds };
  // return await this.http.post('/api/tasks/bulk-approve', payload).toPromise();
}

async assignTasksToMembers(distribution): Promise<any> {
  console.log('Assigning tasks to members:', distribution);
  const payload = { distribution };
  // return await this.http.post('/api/tasks/assign-to-members', payload).toPromise();
}


};