export enum TypedInputType {
  STRING,
  INTEGER,
  FLOAT,
  BOOLEAN,
  // COLOR or other possible custom input types
}

export enum TypedInputRepresentation {
  SCALAR,
  ARRAY,
  ENUM,
}

export enum FormGroupType {
  LIST, // Display all settings in a grouped list
  TABS, // Group form inputs, display groups in horizontal tabs (default)
  TABS_VERTICAL, // Group form inputs, display groups in vertical tabs
}

export class TypedInput {
  id: string; // id as of the metadata.name
  name: string; // Display name of the input
  category: string; // Category e.g. General, Provisioning etc.
  type: TypedInputType;
  representation: TypedInputRepresentation;
  value: any;
  enumValues?: any[]; // If this is of type ENUM this list provides allowed values
  weight: number; // Weight of setting in it's category
}
