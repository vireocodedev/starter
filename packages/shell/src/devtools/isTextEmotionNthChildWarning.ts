export function isTextEmotionNthChildWarning(text: unknown): boolean {
  return (
    typeof text === "string" &&
    text.includes('The pseudo class ":nth-child" is potentially unsafe when doing server-side rendering')
  );
}
