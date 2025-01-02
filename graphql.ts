export function query(endpoint: string, query: string, variables: any) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: variables,
    })
  })
}
