export class AppBackend {
  constructor() {

  }

  get() {
    return fetch('https://5bf417c491c25b0013a3b9a2.mockapi.io/users')
      .then((response) => response.json())
  }

  create(object) {
    return fetch('https://5bf417c491c25b0013a3b9a2.mockapi.io/users', {
        method: "POST", // *GET, POST, PUT, DELETE, etc. only-if-cached
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(object), // body data type must match 
    })
  }

  delete(id) {
    return fetch(`https://5bf417c491c25b0013a3b9a2.mockapi.io/users/${id}`, {
        method: "DELETE", // *GET, POST, PUT, DELETE, etc. only-if-cached
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
  }
}