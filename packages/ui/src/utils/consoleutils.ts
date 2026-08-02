export type ConsoleTextLabelParam = string | { text: string; color?: string; backgroundColor?: string };
export function getConsoleTextWithLabels(params: ConsoleTextLabelParam[]): string[] {
  const mainStringLog = params.map(param => `%c${typeof param === "string" ? param : param.text}`).join("%c ");
  const styles: string[] = [];

  for (let i = 0; i < params.length; i++) {
    const param = params[i];

    if (typeof param === "string") {
      styles.push("color: inherit; background-color: none;");
    } else {
      styles.push(
        `color: ${param.color ?? "inherit"}; background-color: ${
          param.backgroundColor ?? "none"
        }; padding: 1px 4px; border-radius: 4px;`,
      );
    }

    if (i < params.length - 1) {
      styles.push("color: inherit; background-color: none");
    }
  }

  return [mainStringLog, ...styles];
}
