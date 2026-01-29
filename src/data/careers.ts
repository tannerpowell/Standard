export const PAYLOCITY_PAGE_URL =
  "https://recruiting.paylocity.com/recruiting/jobs/All/d2425347-8730-4740-80b0-7534e08fd29f/Standard-Safety-Supply";

export const PAYLOCITY_BASE =
  "https://recruiting.paylocity.com";

export interface PaylocityJobLocation {
  LocationId: number;
  ModuleId: number;
  Name: string;
  Address: string | null;
  Address2: string | null;
  Metro: string | null;
  City: string | null;
  State: string | null;
  Zip: string | null;
  Country: string;
  County: string | null;
  SmartyAddressId: string;
}

export interface PaylocityJob {
  JobId: number;
  JobTitle: string;
  LocationName: string;
  ShouldDisplayLocation: boolean;
  PublishedDate: string;
  Description: string;
  IsInternal: boolean;
  HiringDepartment: string | null;
  JobLocation: PaylocityJobLocation;
  IsRemote: boolean;
  IndeedRemoteType: number;
}

export interface PaylocityPageData {
  Departments: string[];
  Jobs: PaylocityJob[];
  Locations: string[];
  ModuleTitle: string;
}
