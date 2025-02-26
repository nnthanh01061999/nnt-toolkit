export const getRenderByType = (
  //@ts-ignore
  config: vscode.WorkspaceConfiguration,
  type?: string
) => {
  if (type === "boolean") {
    return (
      config.get<string>("renderBoolean") || `<BooleanTag value={value} />`
    );
  }
  if (type === "number") {
    return (
      config.get<string>("renderNumber") || `<NumberFormat value={value} />`
    );
  }
  if (type === "date") {
    return (
      config.get<string>("renderDate") || `<DateTimeFormat value={value} />`
    );
  }
  if (type === "string") {
    return (
      config.get<string>("renderString") || `<StringFormat value={value} />`
    );
  }
  return "";
};
