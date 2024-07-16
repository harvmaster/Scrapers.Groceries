export const removeHTML = (html: string): string => {
  return html.replace(/<[^>]*>?/gm, ' ');
}

export const removeDoubleSpaces = (text: string): string => {
  return text.replace(/\s+/g, ' ');
}

export const removeLeadingSpace = (text: string): string => {
  return text.replace(/^\s+/, '');
}

export const removeTrailingSpace = (text: string): string => {
  return text.replace(/\s+$/, '');
}

export const removeLeadingAndTrailingSpace = (text: string): string => {
  return removeLeadingSpace(removeTrailingSpace(text));
}

export const toTitleCase = (text: string): string => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

export const formatText = (text: string): string => {
  let formattedText = removeHTML(text);
  formattedText = removeDoubleSpaces(formattedText);
  formattedText = removeLeadingAndTrailingSpace(formattedText);
  formattedText = toTitleCase(formattedText);
  return formattedText;
}

export default formatText