export function toSnakeCase(str: string): string {
  return str
    .replace(/[\w]([A-Z])/g, function (m) {
      return m[0] + "_" + m[1];
    })
    .toLowerCase();
}

export function toStartCase(str: string): string {
  return str.replace(/\b\w/g, (match) => match.toUpperCase());
}

export function toKebabCase(str: string): string {
  return str.replace(/\s+/g, "-").toLowerCase();
}

export function toLowerCase(str: string): string {
  return str.toLowerCase();
}

export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

export function toCapitalizeCase(str: string): string {
  return str.replace(/\b\w/g, (match) => match.toUpperCase());
}

export const toLabelCase = (value: string) => {
  return value
    .replace(/_/g, " ")
    .replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
};

export function detectJsonType(jsonValue: any): string {
  if (Array.isArray(jsonValue)) {
    return "array";
  } else if (typeof jsonValue === "object" && jsonValue !== null) {
    return "object";
  } else {
    return "unknown";
  }
}

export function detectObjectInterface(jsonArray: object[]): object {
  // Extract the keys of all objects and their types
  const keysAndTypes = jsonArray.reduce((prev: any, curr: any) => {
    const keys = Object.keys(curr);
    keys.forEach((key) => {
      if (!prev.has(key)) {
        const type = typeof curr[key];
        let typeName: string;

        switch (type) {
          case "string":
            typeName = "string";
            const date = new Date(curr[key]);
            if (!isNaN(date.valueOf())) {
              typeName = "date";
            }
            break;
          case "number":
            typeName = "number";
            break;
          case "boolean":
            typeName = "boolean";
            break;
          default:
            typeName = "any";
            break;
        }

        prev.set(key, typeName);
      }
    });

    return prev;
  }, new Map<string, string>());

  // Combine the keys and types into a TypeScript interface
  const interfaceBody = (Array.from(keysAndTypes) as any).reduce(
    (prev: any, [key, type]: any) => ({ ...prev, [key]: type }),
    {}
  );

  // Return the TypeScript code for the interface
  return interfaceBody;
}
