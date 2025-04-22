export const countriesByRegion = {
	"005": ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY", "SR", "UY", "VE"], 
	"011": ["BF", "BJ", "CI", "CV", "GH", "GM", "GN", "GW", "LR", "ML", "MR", "NE", "NG", "SH", "SL", "SN", "TG"], 
	"013": ["BZ", "CR", "GT", "HN", "MX", "NI", "PA", "SV"], 
	"014": ["BI", "DJ", "ER", "ET", "KE", "KM", "MG", "MU", "MW", "MZ", "RE", "RW", "SC", "SO", "TZ", "UG", "YT", "ZM", "ZW"], 
	"015": ["DZ", "EG", "EH", "LY", "MA", "SD", "TN"], 
	"017": ["AO", "CD", "ZR", "CF", "CG", "CM", "GA", "GQ", "ST", "TD"], 
	"018": ["BW", "LS", "NA", "SZ", "ZA"], 
	"021": ["BM", "CA", "GL", "PM", "US"], 
	"029": ["AG", "AI", "AN", "AW", "BB", "BL", "BS", "CU", "DM", "DO", "GD", "GP", "HT", "JM", "KN", "KY", "LC", "MF", "MQ", "MS", "PR", "TC", "TT", "VC", "VG", "VI"], 
	"030": ["CN", "HK", "JP", "KP", "KR", "MN", "MO", "TW"], 
	"034": ["AF", "BD", "BT", "IN", "IR", "LK", "MV", "NP", "PK"], 
	"035": ["BN", "ID", "KH", "LA", "MM", "BU", "MY", "PH", "SG", "TH", "TL", "TP", "VN"], 
	"039": ["AD", "AL", "BA", "ES", "GI", "GR", "HR", "IT", "ME", "MK", "MT", "CS", "RS", "PT", "SI", "SM", "VA", "YU"], 
	"053": ["AU", "NF", "NZ"], 
	"054": ["FJ", "NC", "PG", "SB", "VU"], 
	"057": ["FM", "GU", "KI", "MH", "MP", "NR", "PW"], 
	"061": ["AS", "CK", "NU", "PF", "PN", "TK", "TO", "TV", "WF", "WS"], 
	"143": ["TM", "TJ", "KG", "KZ", "UZ"], 
	"145": ["AE", "AM", "AZ", "BH", "CY", "GE", "IL", "IQ", "JO", "KW", "LB", "OM", "PS", "QA", "SA", "NT", "SY", "TR", "YE", "YD"], 
	"151": ["BG", "BY", "CZ", "HU", "MD", "PL", "RO", "RU", "SU", "SK", "UA"], 
	"154": ["GG", "IM", "JE", "AX", "DK", "EE", "FI", "FO", "GB", "IE", "IM", "IS", "LT", "LV", "NO", "SE", "SJ"], 
	"155": ["AT", "BE", "CH", "DE", "DD", "FR", "FX", "LI", "LU", "MC", "NL"]
	}

export const countrytValuesByRegion = {
	"015": "Northern Africa",
	"011": "Western Africa",
	"017": "Middle Africa",
	"014": "Eastern Africa",
	"018": "Southern Africa",
	"154": "Northern Europe",
	"155": "Western Europe",
	"151": "Eastern Europe",
	"039": "Southern Europe",
	"021": "Northern America",
	"029": "Caribbean",
	"013": "Central America",
	"005": "South America",
	"143": "Central Asia",
	"030": "Eastern Asia",
	"034": "Southern Asia",
	"035": "South-Eastern Asia",
	"145": "Western Asia",
	"053": "Australia and New Zealand",
	"054": "Melanesia",
	"057": "Micronesia",
	"061": "Polynesia"
}


export const RegionValuesByContinent = {
	"002":{
		'name': "Africa",
		'regions': [
			"015",
			"011",
			"017",
			"014",
			"018"
		]
	},
	"150":{
		'name': "Europe",
		'regions': [
			"154",
			"155",
			"151",
			"039"
		]
	},
	"019":{
		'name': "Americas",
		'regions': [
			"021",
			"029",
			"013",
			"005"		]
	},
	"142":{
		'name': "Asia",
		'regions': [
			"143",
			"030",
			"034",
			"035",
			"145"
		]
	},
	"009":{
		'name': "Oceania",
		'regions': [
			"053",
			"054",
			"057",
			"061"
		]
	},
}

export const countriesByContinent = {

	// africa
	"AFR": ["DZ", "AO", "BW", "BI", "CM", "CV", "CF", "TD", "KM", "YT",
		"CG", "CD", "BJ", "GQ", "ET", "ER", "DJ", "GA", "GM", "GH",
		"GN", "CI", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR",
		"MU", "MA", "MZ", "NA", "NE", "NG", "GW", "RE", "RW", "SH",
		"ST", "SN", "SC", "SL", "SO", "ZA", "ZW", "SS", "EH", "SD",
		"SZ", "TG", "TN", "UG", "EG", "TZ", "BF", "ZM"],

	// antartica
	"ANT": ["AQ", "BV", "GS", "TF", "HM"],

	// asia
	"ASI": ["AF", "AZ", "BH", "BD", "AM", "BT", "IO", "BN", "MM", "KH",
		"LK", "CN", "TW", "CX", "CC", "CY", "GE", "PS", "HK", "IN",
		"ID", "IR", "IQ", "IL", "JP", "KZ", "JO", "KP", "KR", "KW",
		"KG", "LA", "LB", "MO", "MY", "MV", "MN", "OM", "NP", "PK",
		"PH", "TL", "QA", "RU", "SA", "SG", "VN", "SY", "TJ", "TH",
		"AE", "TR", "TM", "UZ", "YE", "XE", "XD", "XS"],

	// north america
	"NAM": ["AG", "BS", "BB", "BM", "BZ", "VG", "CA", "KY", "CR", "CU",
		"DM", "DO", "SV", "GL", "GD", "GP", "GT", "HT", "HN", "JM",
		"MQ", "MX", "MS", "AN", "CW", "AW", "SX", "BQ", "NI", "UM",
		"PA", "PR", "BL", "KN", "AI", "LC", "MF", "PM", "VC", "TT",
		"TC", "US", "VI"],

	// south america
	"SAM": ["AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PY",
		"PE", "SR", "UY", "VE"],
	// europe
	"EUR": ["AL", "AD", "AZ", "AT", "AM", "BE", "BA", "BG", "BY", "HR",
		"CY", "CZ", "DK", "EE", "FO", "FI", "AX", "FR", "GE", "DE",
		"GI", "GR", "VA", "HU", "IS", "IE", "IT", "KZ", "LV", "LI",
		"LT", "LU", "MT", "MC", "MD", "ME", "NL", "NO", "PL", "PT",
		"RO", "RU", "SM", "RS", "SK", "SI", "ES", "SJ", "SE", "CH",
		"TR", "UA", "MK", "GB", "GG", "JE", "IM"],
	// oceana
	"OCE": ["AS", "AU", "SB", "CK", "FJ", "PF", "KI", "GU", "NR", "NC",
		"VU", "NZ", "NU", "NF", "MP", "UM", "FM", "MH", "PW", "PG",
		"PN", "TK", "TO", "TV", "WF", "WS"],

	// multi-national / international

	"XXX": ["WO", "EM", "WHO", "BX", "LISBON", "SIXTER", "AP", "OA"]

}
