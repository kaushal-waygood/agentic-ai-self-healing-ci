export interface ApplyMethod {
  method: 'EMAIL' | 'LINK' | 'OTHER'; // Add other possible methods
  emails?: string[];
  link?: string;
}

export interface ContractLength {
  value: number;
  type: 'MONTHS' | 'YEARS' | 'WEEKS'; // Add other possible types
}

export interface Salary {
  min: number;
  max: number;
  period: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
}

export interface Location {
  city: string;
  lat: number;
  lng: number;
  country?: string;
  address?: string;
}

export interface Job {
  _id: string;
  jobId: string;
  origin: 'HOSTED' | 'EXTERNAL' | 'OTHER'; // Add other possible origins
  title: string;
  description: string;
  company: string;
  organizationId: string;
  jobTypes: (
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'TEMPORARY'
    | 'INTERNSHIP'
  )[];
  resumeRequired: boolean;
  jobAddress: string;
  country: string;
  applyMethod: ApplyMethod;
  contractLength?: ContractLength;
  salary?: Salary;
  location: Location;
  tags: string[];
  taxonomyAttributes: string[];
  queries: string[];
  createdAt: string;
  updatedAt: string;
}
