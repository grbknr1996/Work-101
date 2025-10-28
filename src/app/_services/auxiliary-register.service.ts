import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

export interface AuxiliaryStats {
    powerOfAttorneysQuantity: number;
    licensesQuantity: number;
    debtsQuantity: number;
}

export interface AuxiliaryRegister {
    documentNumber: string,
    registrationDate: string,
    cancellationDate: string | null,
    grantorName: string,
    granteeName: string,
    status: string
}

@Injectable({ providedIn: 'root' })
export class AuxiliaryRegisterService {

    getAuxiliaryStats(): Observable<any> {
        return of({
            powerOfAttorneysQuantity: 1247,
            licensesQuantity: 892,
            debtsQuantity: 654
        })
    }

    getAuxiliaryRegisterData(): Observable<any> {
        return of(
            [
                {
                    "documentNumber": "POA-2024-001234",
                    "registrationDate": "2024-09-15",
                    "cancellationDate": null,
                    "grantorName": "Arthur Cook",
                    "granteeName": "Harper Wright",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001235",
                    "registrationDate": "2024-09-14",
                    "cancellationDate": null,
                    "grantorName": "Arthur Gray",
                    "granteeName": "Ava Scott",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001236",
                    "registrationDate": "2024-09-13",
                    "cancellationDate": "2024-09-30",
                    "grantorName": "Charles Parker",
                    "granteeName": "Amelia Mitchell",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001237",
                    "registrationDate": "2024-09-12",
                    "cancellationDate": null,
                    "grantorName": "Thomas Bennett",
                    "granteeName": "Amelia Nelson",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001238",
                    "registrationDate": "2024-09-11",
                    "cancellationDate": "2024-09-27",
                    "grantorName": "James Evans",
                    "granteeName": "Harper Green",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001239",
                    "registrationDate": "2024-09-10",
                    "cancellationDate": null,
                    "grantorName": "Thomas Evans",
                    "granteeName": "Sophia King",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001240",
                    "registrationDate": "2024-09-09",
                    "cancellationDate": "2024-09-27",
                    "grantorName": "Henry Cook",
                    "granteeName": "Mia Mitchell",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001241",
                    "registrationDate": "2024-09-08",
                    "cancellationDate": "2024-09-20",
                    "grantorName": "George Gray",
                    "granteeName": "Sophia Wright",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001242",
                    "registrationDate": "2024-09-07",
                    "cancellationDate": null,
                    "grantorName": "William Ross",
                    "granteeName": "Isabella Green",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001243",
                    "registrationDate": "2024-09-06",
                    "cancellationDate": null,
                    "grantorName": "James Parker",
                    "granteeName": "Isabella Carter",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001244",
                    "registrationDate": "2024-09-05",
                    "cancellationDate": null,
                    "grantorName": "William Bryant",
                    "granteeName": "Amelia Wright",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001245",
                    "registrationDate": "2024-09-04",
                    "cancellationDate": "2024-09-19",
                    "grantorName": "Thomas Walker",
                    "granteeName": "Evelyn Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001246",
                    "registrationDate": "2024-09-03",
                    "cancellationDate": null,
                    "grantorName": "Arthur Bryant",
                    "granteeName": "Mia Baker",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001247",
                    "registrationDate": "2024-09-02",
                    "cancellationDate": "2024-09-25",
                    "grantorName": "Albert Foster",
                    "granteeName": "Amelia King",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001248",
                    "registrationDate": "2024-09-01",
                    "cancellationDate": null,
                    "grantorName": "Charles Evans",
                    "granteeName": "Ava Nelson",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001249",
                    "registrationDate": "2024-08-31",
                    "cancellationDate": null,
                    "grantorName": "Henry Cook",
                    "granteeName": "Mia Scott",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001250",
                    "registrationDate": "2024-08-30",
                    "cancellationDate": null,
                    "grantorName": "Arthur Evans",
                    "granteeName": "Isabella King",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001251",
                    "registrationDate": "2024-08-29",
                    "cancellationDate": "2024-09-20",
                    "grantorName": "Thomas Bennett",
                    "granteeName": "Abigail Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001252",
                    "registrationDate": "2024-08-28",
                    "cancellationDate": null,
                    "grantorName": "James Parker",
                    "granteeName": "Isabella Perez",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001253",
                    "registrationDate": "2024-08-27",
                    "cancellationDate": null,
                    "grantorName": "Thomas Bryant",
                    "granteeName": "Olivia Wright",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001254",
                    "registrationDate": "2024-08-26",
                    "cancellationDate": null,
                    "grantorName": "Henry Foster",
                    "granteeName": "Harper Scott",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001255",
                    "registrationDate": "2024-08-25",
                    "cancellationDate": null,
                    "grantorName": "Henry Ross",
                    "granteeName": "Isabella Scott",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001256",
                    "registrationDate": "2024-08-24",
                    "cancellationDate": null,
                    "grantorName": "William Bennett",
                    "granteeName": "Mia Nelson",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001257",
                    "registrationDate": "2024-08-23",
                    "cancellationDate": "2024-09-04",
                    "grantorName": "Joseph Hughes",
                    "granteeName": "Abigail Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001258",
                    "registrationDate": "2024-08-22",
                    "cancellationDate": null,
                    "grantorName": "James Bryant",
                    "granteeName": "Amelia Adams",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001259",
                    "registrationDate": "2024-08-21",
                    "cancellationDate": "2024-08-31",
                    "grantorName": "George Cook",
                    "granteeName": "Abigail Nelson",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001260",
                    "registrationDate": "2024-08-20",
                    "cancellationDate": null,
                    "grantorName": "Henry Gray",
                    "granteeName": "Charlotte Scott",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001261",
                    "registrationDate": "2024-08-19",
                    "cancellationDate": null,
                    "grantorName": "Henry Foster",
                    "granteeName": "Mia Adams",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001262",
                    "registrationDate": "2024-08-18",
                    "cancellationDate": "2024-09-03",
                    "grantorName": "Joseph Gray",
                    "granteeName": "Sophia Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001263",
                    "registrationDate": "2024-08-17",
                    "cancellationDate": null,
                    "grantorName": "Charles Bennett",
                    "granteeName": "Evelyn Green",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001264",
                    "registrationDate": "2024-08-16",
                    "cancellationDate": "2024-09-08",
                    "grantorName": "Joseph Foster",
                    "granteeName": "Amelia Mitchell",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001265",
                    "registrationDate": "2024-08-15",
                    "cancellationDate": null,
                    "grantorName": "Albert Gray",
                    "granteeName": "Ava Mitchell",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001266",
                    "registrationDate": "2024-08-14",
                    "cancellationDate": null,
                    "grantorName": "Samuel Parker",
                    "granteeName": "Isabella Wright",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001267",
                    "registrationDate": "2024-08-13",
                    "cancellationDate": null,
                    "grantorName": "Thomas Bennett",
                    "granteeName": "Amelia Nelson",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001268",
                    "registrationDate": "2024-08-12",
                    "cancellationDate": "2024-09-04",
                    "grantorName": "Arthur Cook",
                    "granteeName": "Amelia Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001269",
                    "registrationDate": "2024-08-11",
                    "cancellationDate": "2024-08-25",
                    "grantorName": "William Cook",
                    "granteeName": "Abigail Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001270",
                    "registrationDate": "2024-08-10",
                    "cancellationDate": null,
                    "grantorName": "Albert Hughes",
                    "granteeName": "Harper Green",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001271",
                    "registrationDate": "2024-08-09",
                    "cancellationDate": "2024-08-26",
                    "grantorName": "James Hughes",
                    "granteeName": "Mia Baker",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001272",
                    "registrationDate": "2024-08-08",
                    "cancellationDate": null,
                    "grantorName": "Joseph Walker",
                    "granteeName": "Sophia Perez",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001273",
                    "registrationDate": "2024-08-07",
                    "cancellationDate": null,
                    "grantorName": "Arthur Bennett",
                    "granteeName": "Olivia Adams",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001274",
                    "registrationDate": "2024-08-06",
                    "cancellationDate": null,
                    "grantorName": "William Bennett",
                    "granteeName": "Olivia Adams",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001275",
                    "registrationDate": "2024-08-05",
                    "cancellationDate": "2024-08-29",
                    "grantorName": "Henry Gray",
                    "granteeName": "Charlotte Scott",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001276",
                    "registrationDate": "2024-08-04",
                    "cancellationDate": null,
                    "grantorName": "Henry Evans",
                    "granteeName": "Evelyn Scott",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001277",
                    "registrationDate": "2024-08-03",
                    "cancellationDate": null,
                    "grantorName": "James Hughes",
                    "granteeName": "Amelia Nelson",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001278",
                    "registrationDate": "2024-08-02",
                    "cancellationDate": "2024-08-18",
                    "grantorName": "Charles Bryant",
                    "granteeName": "Olivia Perez",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001279",
                    "registrationDate": "2024-08-01",
                    "cancellationDate": "2024-08-13",
                    "grantorName": "Joseph Bennett",
                    "granteeName": "Sophia Mitchell",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001280",
                    "registrationDate": "2024-07-31",
                    "cancellationDate": "2024-08-17",
                    "grantorName": "James Walker",
                    "granteeName": "Amelia Green",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001281",
                    "registrationDate": "2024-07-30",
                    "cancellationDate": null,
                    "grantorName": "Henry Bryant",
                    "granteeName": "Evelyn Mitchell",
                    "status": "active"
                },
                {
                    "documentNumber": "POA-2024-001282",
                    "registrationDate": "2024-07-29",
                    "cancellationDate": "2024-08-15",
                    "grantorName": "Charles Ross",
                    "granteeName": "Sophia Green",
                    "status": "cancelled"
                },
                {
                    "documentNumber": "POA-2024-001283",
                    "registrationDate": "2024-07-28",
                    "cancellationDate": "2024-08-09",
                    "grantorName": "Samuel Foster",
                    "granteeName": "Mia Green",
                    "status": "cancelled"
                }
            ]
        )
    }

}