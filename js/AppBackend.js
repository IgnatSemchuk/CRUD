export class AppBackend {
  constructor() {
    this.baseURI = 'https://5bf417c491c25b0013a3b9a2.mockapi.io';
  }

  get(options) {
    if (!options) {
      return fetch(`${this.baseURI}/users`)
        .then((response) => response.json());
    };
    if (typeof options === 'number') {
      return fetch(`${this.baseURI}/users/${options}`)
        .then((response) => response.json());
    };
    if (typeof options === 'object') {
      return fetch(`${this.baseURI}/users?page=${options.page}&limit=${options.limit}`)
      .then((response) => response.json());
    };
  }

  create(object) {
    return fetch(`${this.baseURI}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(object),
    });
  }

  update(id) {
    return fetch(`${this.baseURI}/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        }
    });
  }

  delete(id) {
    return fetch(`${this.baseURI}/users/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    });
  }
}