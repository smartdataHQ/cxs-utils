/**
 * TypeScript interfaces for Event Bible data structures
 */

export interface Alias {
  name: string;
  vertical: string;
  topic: string;
  description: string;
  extraVerticalAttributes: string;
}

export interface SemanticEvent {
  airtable_id: string;
  name: string;
  description: string;
  category: string;
  domain: string; // Domain can be a string or array of strings
  aliases: Alias[];
  topic: string;
  lastUpdated: string;
  // Required fields (value can be empty but field should be included)
  extraCategoryAttributes: string;
  extraDomainAttributes: string;
  // Optional fields
  deprecated?: boolean;
  deprecationReason?: string;
  deprecationDate?: string;
  replacementEvent?: string;
  documentation?: string;
}

export interface AirtableRecord<T = any> {
  id: string;
  fields: T;
  createdTime: string;
}

export interface AirtableEventFields {
  'Name': string;
  'Category': string;
  'Domain': string;
  'Description': string;
  'Topic': string;
  'Aliases'?: string[];
  // Required fields (value can be empty but field should be included)
  'Extra Category Attributes': string;
  'Extra Domain Attributes': string;
  // Optional fields that may be added later
  'CategoryJoin'?: string[];
  'DomainLookup'?: string[];
  'Documentation'?: string;
  'Last Updated'?: string;
  'Deprecated'?: boolean;
  'Deprecation Reason'?: string;
  'Deprecation Date'?: string;
  'Replacement Event'?: string;
}

export interface AirtableAliasFields {
  'Alias': string;
  'Vertical': string;
  'Topic': string;
  'Description'?: string;
  'Extra Vertical Attributes': string;
}

export interface AirtableResponse<T = any> {
  records: AirtableRecord<T>[];
  offset?: string;
}

export interface EventBibleConfig {
  apiKey: string;
  baseId: string;
  eventsTableId: string;
  aliasesTableId: string;
  rateLimitDelay?: number;
  maxRetries?: number;
  timeoutSeconds?: number;
}

export interface EventBibleError {
  message: string;
  code?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}