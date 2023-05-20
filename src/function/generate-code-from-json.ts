import {
  detectJsonType,
  toSnakeCase,
  toCapitalizeCase,
  toStartCase,
} from "../utils/format";

export const generateMessageFromJson = (
  json: string,
  title: string = "example"
) => {
  const dataJson = JSON.parse(json);

  const typeJson = detectJsonType(dataJson);

  const uniqueKeys = Object.keys(
    typeJson === "array" ? Object.assign({}, ...dataJson) : dataJson
  );

  const fields = uniqueKeys.map((item) => {
    return {
      key: toSnakeCase(item),
      name: toCapitalizeCase(item),
    };
  });

  const key = toStartCase(title || "Example");

  return `{
          "title": "${key} - Midea Media",
          "label": "${key}",
          "filter": {
              "keyword": {
                  "title": "Keyword",
                  "placeholder": "Search Name, Code "
              },
              "is_using": {
                  "title": "Enabling",
                  "placeholder": "Enabling"
              }
          },
          "table": {
              "columns": {${fields
                ?.map((field) => `\n\t"${field.key}": "${field.name}",`)
                ?.join("")}
              }
          },
          "form": {
              ${fields
                ?.map(
                  (field) => `\n\t"${field.key}": {
                   "title": "${field.name}"
              },`
                )
                ?.join("")}
          }
      }
      `;
};
