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

export function detectJsonType(jsonValue: any): string {
  if (Array.isArray(jsonValue)) {
    return "array";
  } else if (typeof jsonValue === "object" && jsonValue !== null) {
    return "object";
  } else {
    return "unknown";
  }
}
