export class RestClient {
	private readonly baseUrl = "https://games-nest.jeff-rossi.com"
	private headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
	private mergeHeaders(headers?: { [key: string]: string }) {
		if (!headers) headers = {}
		for (const key in this.headers) {
			headers[key] = this.headers[key]
		}
		return headers
	}

	private buildQueryString(path: string, params?: { [key: string]: any }) {
		let url = `${this.baseUrl}/${path}`
		if (params && Object.keys(params).length) {
			let p = []
			for (const key in params) {
				p.push(`${key}=${params[key]}`)
			}
			url += '?' + p.join("&")
		}
		return url
	}

	async get(options: { path: string, params?: { [key: string]: any }, headers?: { [key: string]: string }}) {
		const url = this.buildQueryString(options.path,options.params)
		return fetch(url, {
			method: 'GET',
			headers: this.mergeHeaders(options.headers)
		})
	}

	async post(options: {path: string, payload: { [key: string]: any }, headers?: { [key: string]: string }}) {
		return fetch(`${this.baseUrl}/${options.path}`, {
			method: 'POST',
			body: JSON.stringify(options.payload),
			headers: this.mergeHeaders(options.headers)
		})
	}

	async patch(options: {path: string, payload: { [key: string]: any }, headers?: { [key: string]: string } }) {
		return fetch(`${this.baseUrl}/${options.path}`, {
			method: 'PATCH',
			body: JSON.stringify(options.payload),
			headers: this.mergeHeaders(options.headers)
		})
	}

	async delete(options: { path: string, headers?: { [key: string]: string }}) {
		return fetch(`${this.baseUrl}/${options.path}`, {
			method: 'DELETE',
			headers: this.mergeHeaders(options.headers)
		})
	}
}