
// --- 全球节假日数据库 ---
export const GLOBAL_HOLIDAYS: Record<string, Record<number, {name: string, date: string}[]>> = {
  "Australia": {
    2025: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Australia Day", date: "Jan 27" },
      { name: "Labour Day (VIC)", date: "Mar 10" }, { name: "Good Friday", date: "Apr 18" },
      { name: "Easter Saturday", date: "Apr 19" }, { name: "Easter Sunday", date: "Apr 20" },
      { name: "Easter Monday", date: "Apr 21" }, { name: "Anzac Day", date: "Apr 25" },
      { name: "King's Birthday", date: "Jun 09" }, { name: "AFL Grand Final Eve", date: "Sep 26" },
      { name: "Melbourne Cup", date: "Nov 04" }, { name: "Christmas Day", date: "Dec 25" },
      { name: "Boxing Day", date: "Dec 26" }
    ],
    2026: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Australia Day", date: "Jan 26" },
      { name: "Labour Day (VIC)", date: "Mar 09" }, { name: "Good Friday", date: "Apr 03" },
      { name: "Easter Monday", date: "Apr 06" }, { name: "Anzac Day", date: "Apr 25" },
      { name: "King's Birthday", date: "Jun 08" }, { name: "AFL Grand Final Eve", date: "Sep 25" },
      { name: "Melbourne Cup", date: "Nov 03" }, { name: "Christmas Day", date: "Dec 25" },
      { name: "Boxing Day", date: "Dec 26" }
    ],
    2027: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Australia Day", date: "Jan 26" },
      { name: "Labour Day (VIC)", date: "Mar 08" }, { name: "Good Friday", date: "Mar 26" },
      { name: "Easter Monday", date: "Mar 29" }, { name: "Anzac Day", date: "Apr 25" },
      { name: "King's Birthday", date: "Jun 14" }, { name: "AFL Grand Final Eve", date: "Sep 24" },
      { name: "Melbourne Cup", date: "Nov 02" }, { name: "Christmas Day", date: "Dec 25" },
      { name: "Boxing Day", date: "Dec 26" }
    ],
    2028: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Australia Day", date: "Jan 26" },
      { name: "Labour Day (VIC)", date: "Mar 13" }, { name: "Good Friday", date: "Apr 14" },
      { name: "Easter Monday", date: "Apr 17" }, { name: "Anzac Day", date: "Apr 25" },
      { name: "King's Birthday", date: "Jun 12" }, { name: "AFL Grand Final Eve", date: "Sep 29" },
      { name: "Melbourne Cup", date: "Nov 07" }, { name: "Christmas Day", date: "Dec 25" },
      { name: "Boxing Day", date: "Dec 26" }
    ]
  },
  "China": {
    2025: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Spring Festival", date: "Jan 29" },
      { name: "Qingming Festival", date: "Apr 04" }, { name: "Labour Day", date: "May 01" },
      { name: "Dragon Boat Festival", date: "May 31" }, { name: "Mid-Autumn Festival", date: "Oct 06" },
      { name: "National Day", date: "Oct 01" }
    ],
    2026: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Spring Festival", date: "Feb 17" },
      { name: "Qingming Festival", date: "Apr 05" }, { name: "Labour Day", date: "May 01" },
      { name: "Dragon Boat Festival", date: "Jun 19" }, { name: "Mid-Autumn Festival", date: "Sep 25" },
      { name: "National Day", date: "Oct 01" }
    ],
    2027: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Spring Festival", date: "Feb 06" },
      { name: "Qingming Festival", date: "Apr 05" }, { name: "Labour Day", date: "May 01" },
      { name: "Dragon Boat Festival", date: "Jun 09" }, { name: "Mid-Autumn Festival", date: "Sep 15" },
      { name: "National Day", date: "Oct 01" }
    ],
    2028: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Spring Festival", date: "Jan 26" },
      { name: "Qingming Festival", date: "Apr 04" }, { name: "Labour Day", date: "May 01" },
      { name: "Dragon Boat Festival", date: "May 28" }, { name: "Mid-Autumn Festival", date: "Oct 03" },
      { name: "National Day", date: "Oct 01" }
    ]
  },
  "USA": {
    2025: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "MLK Day", date: "Jan 20" },
      { name: "Presidents' Day", date: "Feb 17" }, { name: "Memorial Day", date: "May 26" },
      { name: "Juneteenth", date: "Jun 19" }, { name: "Independence Day", date: "Jul 04" },
      { name: "Labor Day", date: "Sep 01" }, { name: "Columbus Day", date: "Oct 13" },
      { name: "Veterans Day", date: "Nov 11" }, { name: "Thanksgiving", date: "Nov 27" },
      { name: "Christmas Day", date: "Dec 25" }
    ],
    2026: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "MLK Day", date: "Jan 19" },
      { name: "Presidents' Day", date: "Feb 16" }, { name: "Memorial Day", date: "May 25" },
      { name: "Juneteenth", date: "Jun 19" }, { name: "Independence Day", date: "Jul 04" },
      { name: "Labor Day", date: "Sep 07" }, { name: "Columbus Day", date: "Oct 12" },
      { name: "Veterans Day", date: "Nov 11" }, { name: "Thanksgiving", date: "Nov 26" },
      { name: "Christmas Day", date: "Dec 25" }
    ],
    2027: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "MLK Day", date: "Jan 18" },
      { name: "Presidents' Day", date: "Feb 15" }, { name: "Memorial Day", date: "May 31" },
      { name: "Juneteenth", date: "Jun 19" }, { name: "Independence Day", date: "Jul 04" },
      { name: "Labor Day", date: "Sep 06" }, { name: "Columbus Day", date: "Oct 11" },
      { name: "Veterans Day", date: "Nov 11" }, { name: "Thanksgiving", date: "Nov 25" },
      { name: "Christmas Day", date: "Dec 25" }
    ],
    2028: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "MLK Day", date: "Jan 17" },
      { name: "Presidents' Day", date: "Feb 21" }, { name: "Memorial Day", date: "May 29" },
      { name: "Juneteenth", date: "Jun 19" }, { name: "Independence Day", date: "Jul 04" },
      { name: "Labor Day", date: "Sep 04" }, { name: "Columbus Day", date: "Oct 09" },
      { name: "Veterans Day", date: "Nov 11" }, { name: "Thanksgiving", date: "Nov 23" },
      { name: "Christmas Day", date: "Dec 25" }
    ]
  },
  "Malaysia": {
    2025: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Chinese New Year", date: "Jan 29" },
      { name: "Thaipusam", date: "Feb 11" }, { name: "Hari Raya Aidilfitri", date: "Mar 31" },
      { name: "Labour Day", date: "May 01" }, { name: "Wesak Day", date: "May 12" },
      { name: "Agong's Birthday", date: "Jun 02" }, { name: "Hari Raya Haji", date: "Jun 06" },
      { name: "Awal Muharram", date: "Jun 26" }, { name: "Merdeka Day", date: "Aug 31" },
      { name: "Malaysia Day", date: "Sep 16" }, { name: "Maulidur Rasul", date: "Sep 05" },
      { name: "Deepavali", date: "Oct 20" }, { name: "Christmas Day", date: "Dec 25" }
    ],
    2026: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Chinese New Year", date: "Feb 17" },
      { name: "Thaipusam", date: "Jan 31" }, { name: "Hari Raya Aidilfitri", date: "Mar 20" },
      { name: "Labour Day", date: "May 01" }, { name: "Wesak Day", date: "May 31" },
      { name: "Agong's Birthday", date: "Jun 01" }, { name: "Hari Raya Haji", date: "May 26" },
      { name: "Merdeka Day", date: "Aug 31" }, { name: "Malaysia Day", date: "Sep 16" },
      { name: "Deepavali", date: "Nov 08" }, { name: "Christmas Day", date: "Dec 25" }
    ],
    2027: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Chinese New Year", date: "Feb 06" },
      { name: "Hari Raya Aidilfitri", date: "Mar 10" }, { name: "Labour Day", date: "May 01" },
      { name: "Wesak Day", date: "May 20" }, { name: "Merdeka Day", date: "Aug 31" },
      { name: "Malaysia Day", date: "Sep 16" }, { name: "Deepavali", date: "Oct 29" },
      { name: "Christmas Day", date: "Dec 25" }
    ],
    2028: [
      { name: "New Year's Day", date: "Jan 01" }, { name: "Chinese New Year", date: "Jan 26" },
      { name: "Hari Raya Aidilfitri", date: "Feb 27" }, { name: "Labour Day", date: "May 01" },
      { name: "Wesak Day", date: "May 09" }, { name: "Merdeka Day", date: "Aug 31" },
      { name: "Malaysia Day", date: "Sep 16" }, { name: "Deepavali", date: "Oct 17" },
      { name: "Christmas Day", date: "Dec 25" }
    ]
  },
  "Germany": {
    2025: [
      { name: "Neujahr", date: "Jan 01" }, { name: "Karfreitag", date: "Apr 18" },
      { name: "Ostermontag", date: "Apr 21" }, { name: "Tag der Arbeit", date: "May 01" },
      { name: "Christi Himmelfahrt", date: "May 29" }, { name: "Pfingstmontag", date: "Jun 09" },
      { name: "Tag der Einheit", date: "Oct 03" }, { name: "1. Weihnachtstag", date: "Dec 25" },
      { name: "2. Weihnachtstag", date: "Dec 26" }
    ],
    2026: [
      { name: "Neujahr", date: "Jan 01" }, { name: "Karfreitag", date: "Apr 03" },
      { name: "Ostermontag", date: "Apr 06" }, { name: "Tag der Arbeit", date: "May 01" },
      { name: "Christi Himmelfahrt", date: "May 14" }, { name: "Pfingstmontag", date: "May 25" },
      { name: "Tag der Einheit", date: "Oct 03" }, { name: "1. Weihnachtstag", date: "Dec 25" },
      { name: "2. Weihnachtstag", date: "Dec 26" }
    ],
    2027: [
      { name: "Neujahr", date: "Jan 01" }, { name: "Karfreitag", date: "Mar 26" },
      { name: "Ostermontag", date: "Mar 29" }, { name: "Tag der Arbeit", date: "May 01" },
      { name: "Christi Himmelfahrt", date: "May 06" }, { name: "Pfingstmontag", date: "May 17" },
      { name: "Tag der Einheit", date: "Oct 03" }, { name: "1. Weihnachtstag", date: "Dec 25" },
      { name: "2. Weihnachtstag", date: "Dec 26" }
    ],
    2028: [
      { name: "Neujahr", date: "Jan 01" }, { name: "Karfreitag", date: "Apr 14" },
      { name: "Ostermontag", date: "Apr 17" }, { name: "Tag der Arbeit", date: "May 01" },
      { name: "Christi Himmelfahrt", date: "May 25" }, { name: "Pfingstmontag", date: "Jun 05" },
      { name: "Tag der Einheit", date: "Oct 03" }, { name: "1. Weihnachtstag", date: "Dec 25" },
      { name: "2. Weihnachtstag", date: "Dec 26" }
    ]
  }
};

// --- 電商節日數據庫 ---
export const REGIONAL_ECOM_FESTIVALS: Record<string, Record<number, {name: string, date: string}[]>> = {
  "Australia": {
    2025: [
      { name: "EOFY Sale", date: "Jun 30" }, { name: "Black Friday", date: "Nov 28" },
      { name: "Cyber Monday", date: "Dec 01" }, { name: "Boxing Day Sale", date: "Dec 26" }
    ],
    2026: [
      { name: "EOFY Sale", date: "Jun 30" }, { name: "Black Friday", date: "Nov 27" },
      { name: "Cyber Monday", date: "Nov 30" }, { name: "Boxing Day Sale", date: "Dec 26" }
    ],
    2027: [
      { name: "EOFY Sale", date: "Jun 30" }, { name: "Black Friday", date: "Nov 26" },
      { name: "Cyber Monday", date: "Nov 29" }, { name: "Boxing Day Sale", date: "Dec 26" }
    ],
    2028: [
      { name: "EOFY Sale", date: "Jun 30" }, { name: "Black Friday", date: "Nov 24" },
      { name: "Cyber Monday", date: "Nov 27" }, { name: "Boxing Day Sale", date: "Dec 26" }
    ]
  },
  "China": {
    2025: [
      { name: "6.18 Mid-Year Sale", date: "Jun 18" }, { name: "Double 11 Sale", date: "Nov 11" }, { name: "Double 12 Sale", date: "Dec 12" }
    ],
    2026: [{ name: "6.18 Mid-Year", date: "Jun 18" }, { name: "Double 11", date: "Nov 11" }],
    2027: [{ name: "6.18 Mid-Year", date: "Jun 18" }, { name: "Double 11", date: "Nov 11" }],
    2028: [{ name: "6.18 Mid-Year", date: "Jun 18" }, { name: "Double 11", date: "Nov 11" }]
  },
  "USA": {
    2025: [
      { name: "Amazon Prime Day", date: "Jul 15" }, { name: "Labor Day Sale", date: "Sep 01" },
      { name: "Black Friday", date: "Nov 28" }, { name: "Cyber Monday", date: "Dec 01" }
    ],
    2026: [
      { name: "Black Friday", date: "Nov 27" }, { name: "Cyber Monday", date: "Nov 30" }
    ],
    2027: [
      { name: "Black Friday", date: "Nov 26" }, { name: "Cyber Monday", date: "Nov 29" }
    ],
    2028: [
      { name: "Black Friday", date: "Nov 24" }, { name: "Cyber Monday", date: "Nov 27" }
    ]
  },
  "Malaysia": {
    2025: [
      { name: "CNY Mega Sale", date: "Jan 15" }, { name: "Ramadan Bazaar", date: "Mar 10" },
      { name: "MY Cyber Sale", date: "Oct 10" }, { name: "11.11 Global Sale", date: "Nov 11" },
      { name: "12.12 Birthday Sale", date: "Dec 12" }
    ],
    2026: [{ name: "11.11 Sale", date: "Nov 11" }, { name: "12.12 Sale", date: "Dec 12" }],
    2027: [{ name: "11.11 Sale", date: "Nov 11" }, { name: "12.12 Sale", date: "Dec 12" }],
    2028: [{ name: "11.11 Sale", date: "Nov 11" }, { name: "12.12 Sale", date: "Dec 12" }]
  },
  "Germany": {
    2025: [
      { name: "Winterschlussverkauf", date: "Jan 27" }, { name: "Sommerschlussverkauf", date: "Jul 28" },
      { name: "Black Friday", date: "Nov 28" }, { name: "Cyber Monday", date: "Dec 01" }
    ],
    2026: [
      { name: "Black Friday", date: "Nov 27" }, { name: "Cyber Monday", date: "Nov 30" }
    ],
    2027: [
      { name: "Black Friday", date: "Nov 26" }, { name: "Cyber Monday", date: "Nov 29" }
    ],
    2028: [
      { name: "Black Friday", date: "Nov 24" }, { name: "Cyber Monday", date: "Nov 27" }
    ]
  }
};
