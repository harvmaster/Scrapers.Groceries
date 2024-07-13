import type { API_Template } from "../types";

import { API_TEMPLATE } from "../Coles";

export const createSentryCategoryURL = <C extends string, P extends number, V extends string>(category: C, page: P, version: V): API_Template => {
  return API_TEMPLATE
    .replace('{{version}}', version)
    .replace('{{category}}', category)
    .replace('{{page}}', page.toString()) as API_Template
}

export default createSentryCategoryURL