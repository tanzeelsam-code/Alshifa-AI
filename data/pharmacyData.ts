
export interface Pharmacy {
  name: string;
  city: string;
  phone: string;
  whatsapp?: string;
}

export const pharmaciesPK: Pharmacy[] = [
  {
    name: "D Watson",
    city: "Islamabad/Rawalpindi",
    phone: "051-111-999-111",
    whatsapp: "9251111999111"
  },
  {
    name: "Shaheen Chemist",
    city: "Islamabad",
    phone: "051-111-737-824",
    whatsapp: "9251111737824"
  },
  {
    name: "Fazal Din's Pharma Plus",
    city: "Lahore",
    phone: "042-111-555-999",
  },
  {
    name: "Servaid Pharmacy",
    city: "Lahore/Sialkot",
    phone: "042-111-737-824",
  },
  {
    name: "Tehzeeb Bakers & Pharmacy",
    city: "Rawalpindi",
    phone: "051-111-111-999",
  },
  {
    name: "Clinix Pharmacy",
    city: "Karachi",
    phone: "021-111-254-649",
  }
];
