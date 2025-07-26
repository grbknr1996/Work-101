import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class CustomerService {
    getData() {
        return [
            {
                id: 1000,
                name: 'Service Mark',
                country: {
                    name: '5-7 Bussiness Days',
                    code: 'dz'
                },
                company: 'Benton, John B Jr',
                date: '2015-09-13',
                category: 'trademark',
                status: 'active',
                activity: 17,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 70
            },
            {
                id: 1001,
                name: 'Mark',
                country: {
                    name: '7-10 Bussiness Days',
                    code: 'eg'
                },
                company: 'Chanay, Jeffrey A Esq',
                date: '2019-02-09',
                category: 'patent',
                status: 'active',
                activity: 0,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 82
            },
            {
                id: 1002,
                name: 'Conventional Patient',
                country: {
                    name: '10-14 Bussiness Days',
                    code: 'pa'
                },
                company: 'Chemel, James L Cpa',
                date: '2017-05-13',
                category: 'industrial-design',
                status: 'under-review',
                activity: 63,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                balance: 28
            },
            {
                id: 1003,
                name: 'Design',
                country: {
                    name: '2-3 Bussiness Days',
                    code: 'si'
                },
                company: 'Feltz Printing Service',
                date: '2020-09-15',
                category: 'post-qualified',
                status: 'under-review',
                activity: 37,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                balance: 88
            },
            {
                id: 1004,
                name: 'Change of names/addresses',
                country: {
                    name: '2-3 Bussiness Days',
                    code: 'za'
                },
                company: 'Printing Dimensions',
                date: '2016-05-20',
                category: 'patent',
                status: 'active',
                activity: 33,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                balance: 93
            },
            {
                id: 1005,
                name: 'Simona Morasca',
                country: {
                    name: '2-3 Bussiness Days',
                    code: 'eg'
                },
                company: 'Chapman, Ross E Esq',
                date: '2018-02-16',
                category: 'industrial-design',
                status: 'under-review',
                activity: 68,
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                },
                balance: 50
            },
            {
                id: 1006,
                name: 'Mitsue Tollner',
                country: {
                    name: '2-3 Bussiness Days',
                    code: 'py'
                },
                company: 'Morlong Associates',
                date: '2018-02-19',
                category: 'copyright',
                status: 'active',
                activity: 54,
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                },
                balance: 58
            },
            {
                id: 1007,
                name: 'Leota Dilliard',
                country: {
                    name: '2-3 Bussiness Days',
                    code: 'rs'
                },
                company: 'Commercial Press',
                date: '2019-08-13',
                category: 'copyright',
                status: 'active',
                activity: 69,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 26
            },
            {
                id: 1008,
                name: 'Sage Wieser',
                country: {
                    name: '2-3 Bussiness Days',
                    code: 'eg'
                },
                company: 'Truhlar And Truhlar Attys',
                date: '2018-11-21',
                category: 'trademark',
                status: 'active',
                activity: 76,
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                },
                balance: 65
            },
            {
                id: 1009,
                name: 'Kris Marrier',
                country: {
                    name: 'Mexico',
                    code: 'mx'
                },
                company: 'King, Christopher A Esq',
                date: '2015-07-07',
                category: 'patent',
                status: 'under-review',
                activity: 3,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 63
            },
            {
                id: 1010,
                name: 'Minna Amigon',
                country: {
                    name: 'Romania',
                    code: 'ro'
                },
                company: 'Dorl, James J Esq',
                date: '2018-11-07',
                category: 'industrial-design',
                status: 'under-review',
                activity: 38,
                representative: {
                    name: 'Anna Fali',
                    image: 'annafali.png'
                },
                balance: 71
            },
            {
                id: 1011,
                name: 'Abel Maclead',
                country: {
                    name: 'Singapore',
                    code: 'sg'
                },
                company: 'Rangoni Of Florence',
                date: '2017-03-11',
                category: 'industrial-design',
                status: 'active',
                activity: 87,
                representative: {
                    name: 'Bernardo Dominic',
                    image: 'bernardodominic.png'
                },
                balance: 96
            },
            {
                id: 1012,
                name: 'Kiley Caldarera',
                country: {
                    name: 'Serbia',
                    code: 'rs'
                },
                company: 'Feiner Bros',
                date: '2015-10-20',
                category: 'trademark',
                status: 'under-review',
                activity: 80,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 92
            },
            {
                id: 1013,
                name: 'Graciela Ruta',
                country: {
                    name: 'Chile',
                    code: 'cl'
                },
                company: 'Buckley Miller & Wright',
                date: '2016-07-25',
                category: 'gi',
                status: 'under-review',
                activity: 59,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 45
            },
            {
                id: 1014,
                name: 'Cammy Albares',
                country: {
                    name: 'Philippines',
                    code: 'ph'
                },
                company: 'Rousseaux, Michael Esq',
                date: '2019-06-25',
                category: 'post-qualified',
                status: 'active',
                activity: 90,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                balance: 30236
            },
            {
                id: 1015,
                name: 'Mattie Poquette',
                country: {
                    name: 'Venezuela',
                    code: 've'
                },
                company: 'Century Communications',
                date: '2017-12-12',
                category: 'gi',
                status: 'under-review',
                activity: 52,
                representative: {
                    name: 'Anna Fali',
                    image: 'annafali.png'
                },
                balance: 64
            },
            {
                id: 1016,
                name: 'Meaghan Garufi',
                country: {
                    name: 'Malaysia',
                    code: 'my'
                },
                company: 'Bolton, Wilbur Esq',
                date: '2018-07-04',
                category: 'trademark',
                status: 'under-review',
                activity: 31,
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                },
                balance: 37
            },
            {
                id: 1017,
                name: 'Gladys Rim',
                country: {
                    name: 'Netherlands',
                    code: 'nl'
                },
                company: 'T M Byxbee Company Pc',
                date: '2020-02-27',
                category: 'copyright',
                status: 'active',
                activity: 48,
                representative: {
                    name: 'Stephen Shaw',
                    image: 'stephenshaw.png'
                },
                balance: 27
            },
            {
                id: 1018,
                name: 'Yuki Whobrey',
                country: {
                    name: 'Israel',
                    code: 'il'
                },
                company: 'Farmers Insurance Group',
                date: '2017-12-21',
                category: 'gi',
                status: 'active',
                activity: 16,
                representative: {
                    name: 'Bernardo Dominic',
                    image: 'bernardodominic.png'
                },
                balance: 92
            },
            {
                id: 1019,
                name: 'Fletcher Flosi',
                country: {
                    name: 'Argentina',
                    code: 'ar'
                },
                company: 'Post Box Services Plus',
                date: '2016-01-04',
                category: 'copyright',
                status: 'active',
                activity: 19,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                balance: 67
            },
            {
                id: 1020,
                name: 'Bette Nicka',
                country: {
                    name: 'Paraguay',
                    code: 'py'
                },
                company: 'Sport En Art',
                date: '2016-10-21',
                category: 'copyright',
                status: 'under-review',
                activity: 100,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 46
            },
            {
                id: 1021,
                name: 'Veronika Inouye',
                country: {
                    name: 'Ecuador',
                    code: 'ec'
                },
                company: 'C 4 Network Inc',
                date: '2017-03-24',
                category: 'copyright',
                status: 'under-review',
                activity: 72,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 26
            },
            {
                id: 1022,
                name: 'Willard Kolmetz',
                country: {
                    name: 'Tunisia',
                    code: 'tn'
                },
                company: 'Ingalls, Donald R Esq',
                date: '2017-04-15',
                category: 'copyright',
                status: 'active',
                activity: 94,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                balance: 75
            },
            {
                id: 1023,
                name: 'Maryann Royster',
                country: {
                    name: 'Belarus',
                    code: 'by'
                },
                company: 'Franklin, Peter L Esq',
                date: '2017-03-11',
                category: 'industrial-design',
                status: 'under-review',
                activity: 56,
                representative: {
                    name: 'Elwin Sharvill',
                    image: 'elwinsharvill.png'
                },
                balance: 41121
            },
            {
                id: 1024,
                name: 'Alisha Slusarski',
                country: {
                    name: 'Iceland',
                    code: 'is'
                },
                company: 'Wtlz Power 107 Fm',
                date: '2018-03-27',
                category: 'industrial-design',
                status: 'active',
                activity: 7,
                representative: {
                    name: 'Stephen Shaw',
                    image: 'stephenshaw.png'
                },
                balance: 91691
            },
            {
                id: 1025,
                name: 'Allene Iturbide',
                country: {
                    name: 'Italy',
                    code: 'it'
                },
                company: 'Ledecky, David Esq',
                date: '2016-02-20',
                category: 'industrial-design',
                status: 'active',
                activity: 1,
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                },
                balance: 40137
            },
            {
                id: 1026,
                name: 'Chanel Caudy',
                country: {
                    name: 'Argentina',
                    code: 'ar'
                },
                company: 'Professional Image Inc',
                date: '2018-06-24',
                category: 'post-qualified',
                status: 'active',
                activity: 26,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 21304
            },
            {
                id: 1027,
                name: 'Ezekiel Chui',
                country: {
                    name: 'Ireland',
                    code: 'ie'
                },
                company: 'Sider, Donald C Esq',
                date: '2016-09-24',
                category: 'post-qualified',
                status: 'under-review',
                activity: 76,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 60454
            },
            {
                id: 1028,
                name: 'Willow Kusko',
                country: {
                    name: 'Romania',
                    code: 'ro'
                },
                company: 'U Pull It',
                date: '2020-04-11',
                category: 'industrial-design',
                status: 'active',
                activity: 7,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 17565
            },
            {
                id: 1029,
                name: 'Bernardo Figeroa',
                country: {
                    name: 'Israel',
                    code: 'il'
                },
                company: 'Clark, Richard Cpa',
                date: '2018-04-11',
                category: 'copyright',
                status: 'active',
                activity: 81,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 17774
            },
            {
                id: 1030,
                name: 'Ammie Corrio',
                country: {
                    name: 'Hungary',
                    code: 'hu'
                },
                company: 'Moskowitz, Barry S',
                date: '2016-06-11',
                category: 'gi',
                status: 'active',
                activity: 56,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                balance: 49201
            },
            {
                id: 1031,
                name: 'Francine Vocelka',
                country: {
                    name: 'Honduras',
                    code: 'hn'
                },
                company: 'Cascade Realty Advisors Inc',
                date: '2017-08-02',
                category: 'industrial-design',
                status: 'active',
                activity: 94,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 67126
            },
            {
                id: 1032,
                name: 'Ernie Stenseth',
                country: {
                    name: 'Australia',
                    code: 'au'
                },
                company: 'Knwz Newsradio',
                date: '2018-06-06',
                category: 'copyright',
                status: 'active',
                activity: 68,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                balance: 76017
            },
            {
                id: 1033,
                name: 'Albina Glick',
                country: {
                    name: 'Ukraine',
                    code: 'ua'
                },
                company: 'Giampetro, Anthony D',
                date: '2019-08-08',
                category: 'patent',
                status: 'active',
                activity: 85,
                representative: {
                    name: 'Bernardo Dominic',
                    image: 'bernardodominic.png'
                },
                balance: 91201
            },
            {
                id: 1034,
                name: 'Alishia Sergi',
                country: {
                    name: 'Qatar',
                    code: 'qa'
                },
                company: 'Milford Enterprises Inc',
                date: '2018-05-19',
                category: 'gi',
                status: 'under-review',
                activity: 46,
                representative: {
                    name: 'Ivan Magalhaes',
                    image: 'ivanmagalhaes.png'
                },
                balance: 12237
            },
            {
                id: 1035,
                name: 'Solange Shinko',
                country: {
                    name: 'Cameroon',
                    code: 'cm'
                },
                company: 'Mosocco, Ronald A',
                date: '2015-02-12',
                category: 'industrial-design',
                status: 'active',
                activity: 32,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 34072
            },
            {
                id: 1036,
                name: 'Jose Stockham',
                country: {
                    name: 'Italy',
                    code: 'it'
                },
                company: 'Tri State Refueler Co',
                date: '2018-04-25',
                category: 'industrial-design',
                status: 'active',
                activity: 77,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 94909
            },
            {
                id: 1037,
                name: 'Rozella Ostrosky',
                country: {
                    name: 'Venezuela',
                    code: 've'
                },
                company: 'Parkway Company',
                date: '2016-02-27',
                category: 'trademark',
                status: 'active',
                activity: 66,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 57245
            },
            {
                id: 1038,
                name: 'Valentine Gillian',
                country: {
                    name: 'Paraguay',
                    code: 'py'
                },
                company: 'Fbs Business Finance',
                date: '2019-09-17',
                category: 'industrial-design',
                status: 'active',
                activity: 25,
                representative: {
                    name: 'Bernardo Dominic',
                    image: 'bernardodominic.png'
                },
                balance: 75502
            },
            {
                id: 1039,
                name: 'Kati Rulapaugh',
                country: {
                    name: 'Puerto Rico',
                    code: 'pr'
                },
                company: 'Eder Assocs Consltng Engrs Pc',
                date: '2016-12-03',
                category: 'copyright',
                status: 'under-review',
                activity: 51,
                representative: {
                    name: 'Ioni Bowcher',
                    image: 'ionibowcher.png'
                },
                balance: 82075
            },
            {
                id: 1040,
                name: 'Youlanda Schemmer',
                country: {
                    name: 'Bolivia',
                    code: 'bo'
                },
                company: 'Tri M Tool Inc',
                date: '2017-12-15',
                category: 'gi',
                status: 'active',
                activity: 49,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                balance: 19208
            },
            {
                id: 1041,
                name: 'Dyan Oldroyd',
                country: {
                    name: 'Argentina',
                    code: 'ar'
                },
                company: 'International Eyelets Inc',
                date: '2017-02-02',
                category: 'industrial-design',
                status: 'under-review',
                activity: 5,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 50194
            },
            {
                id: 1042,
                name: 'Roxane Campain',
                country: {
                    name: 'France',
                    code: 'fr'
                },
                company: 'Rapid Trading Intl',
                date: '2018-12-25',
                category: 'trademark',
                status: 'under-review',
                activity: 100,
                representative: {
                    name: 'Anna Fali',
                    image: 'annafali.png'
                },
                balance: 77714
            },
            {
                id: 1043,
                name: 'Lavera Perin',
                country: {
                    name: 'Vietnam',
                    code: 'vn'
                },
                company: 'Abc Enterprises Inc',
                date: '2018-04-10',
                category: 'industrial-design',
                status: 'under-review',
                activity: 71,
                representative: {
                    name: 'Stephen Shaw',
                    image: 'stephenshaw.png'
                },
                balance: 35740
            },
            {
                id: 1044,
                name: 'Erick Ferencz',
                country: {
                    name: 'Belgium',
                    code: 'be'
                },
                company: 'Cindy Turner Associates',
                date: '2018-05-06',
                category: 'trademark',
                status: 'active',
                activity: 54,
                representative: {
                    name: 'Amy Elsner',
                    image: 'amyelsner.png'
                },
                balance: 30790
            },
            {
                id: 1045,
                name: 'Fatima Saylors',
                country: {
                    name: 'Canada',
                    code: 'ca'
                },
                company: 'Stanton, James D Esq',
                date: '2019-07-10',
                category: 'copyright',
                status: 'active',
                activity: 93,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 52343
            },
            {
                id: 1046,
                name: 'Jina Briddick',
                country: {
                    name: 'Mexico',
                    code: 'mx'
                },
                company: 'Grace Pastries Inc',
                date: '2018-02-19',
                category: 'trademark',
                status: 'under-review',
                activity: 97,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                balance: 53966
            },
            {
                id: 1047,
                name: 'Kanisha Waycott',
                country: {
                    name: 'Ecuador',
                    code: 'ec'
                },
                company: 'Schroer, Gene E Esq',
                date: '2019-11-27',
                category: 'post-qualified',
                status: 'under-review',
                activity: 80,
                representative: {
                    name: 'Xuxue Feng',
                    image: 'xuxuefeng.png'
                },
                balance: 9920
            },
            {
                id: 1048,
                name: 'Emerson Bowley',
                country: {
                    name: 'Finland',
                    code: 'fi'
                },
                company: 'Knights Inn',
                date: '2018-11-24',
                category: 'post-qualified',
                status: 'under-review',
                activity: 63,
                representative: {
                    name: 'Stephen Shaw',
                    image: 'stephenshaw.png'
                },
                balance: 78069
            },
            {
                id: 1049,
                name: 'Blair Malet',
                country: {
                    name: 'Finland',
                    code: 'fi'
                },
                company: 'Bollinger Mach Shp & Shipyard',
                date: '2018-04-19',
                category: 'post-qualified',
                status: 'active',
                activity: 92,
                representative: {
                    name: 'Asiya Javayant',
                    image: 'asiyajavayant.png'
                },
                balance: 65005
            },
            {
                id: 1050,
                name: 'Brock Bolognia',
                country: {
                    name: 'Bolivia',
                    code: 'bo'
                },
                company: 'Orinda News',
                date: '2019-09-06',
                category: 'copyright',
                status: 'active',
                activity: 72,
                representative: {
                    name: 'Onyama Limba',
                    image: 'onyamalimba.png'
                },
                balance: 51038
            }
        ];
    }

    constructor(private http: HttpClient) {}
    
    getCustomersMini() {
        return Promise.resolve(this.getData().slice(0, 5));
    }

    getCustomersSmall() {
        return Promise.resolve(this.getData().slice(0, 10));
    }

    getCustomersMedium() {
        return Promise.resolve(this.getData().slice(0, 50));
    }

    getCustomersLarge() {
        return Promise.resolve(this.getData().slice(0, 200));
    }

    getCustomersXLarge() {
        return Promise.resolve(this.getData());
    }

    getCustomers(params?: any) {
        return this.http.get<any>('https://www.primefaces.org/data/customers', { params: params }).toPromise();
    }
};