import { apiJson } from './client'

export function createCompany(company_name: string, slug: string) {
  return apiJson('/api/company', {
    method: 'POST',
    body: JSON.stringify({ company_name, slug }),
    errorMessages: {
      409: 'Ese identificador (slug) ya está en uso. Elige otro.',
    },
  })
}
