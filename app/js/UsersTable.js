import {AppBackend} from './AppBackend.js';

export class UsersTable {

  constructor() {
    this.users = [];
    this.backend = new AppBackend('https://5bf417c491c25b0013a3b9a2.mockapi.io/users');
    this.page = this.initPageIndex();
    this.limitTableRows;
  }

  async init() {
    this.render();
    this.limitTableRows = document.getElementById('si-input-limit').value;
    await this.loadUsers();
    this.renderUsersTable();

    const next = document.querySelector('[data-next]');
    const prev = document.querySelector('[data-preview]');
    prev.setAttribute('disabled', 'disabled');
    if (this.users.length < this.limitTableRows) {
      next.setAttribute('disabled', 'disabled');
    }

    document.addEventListener('click', async (event) => {
      if (next.hasAttribute('disabled')) {
          next.removeAttribute('disabled');
        };
      if (event.target.matches('[data-preview]')) {
        if (this.page() === 2) {
          event.target.setAttribute('disabled', 'disabled');
        }
        this.page(-1);
        await this.loadUsers();
        this.renderUsersTable();
      }


      if (event.target.matches('[data-next]')) {
        if (prev.hasAttribute('disabled')) {
          prev.removeAttribute('disabled');
        };
        this.page(1);
        await this.loadUsers();
        if (this.users.length < this.limitTableRows) {
          event.target.setAttribute('disabled', 'disabled');
        }
        if (this.users.length === 0) {
          event.target.setAttribute('disabled', 'disabled');
          this.page(-1);
          await this.loadUsers();
        }
        this.renderUsersTable();
      }


      if (event.target.matches('[data-delete]')) {
        await this.backend.delete(event.target.dataset.id);
        await this.loadUsers();
        this.renderUsersTable();
      };


      if (event.target.matches('[data-edit]')) {
        event.target.closest('tr').innerHTML = await this.updateUser(+event.target.dataset.id);
      };


      if (event.target.matches('[data-update]')) {
        const editTableRow = event.target.closest('tr');
        const user = {};
        user.id = +event.target.dataset.id;
        user.name = editTableRow.querySelector('[name="name"]').value;
        user.email = editTableRow.querySelector('[name="email"]').value;
        user.description = editTableRow.querySelector('[name="description"]').value;
        user.createdAt = new Date();
        await this.backend.update(user);
        editTableRow.innerHTML = this.renderUser(await this.backend.get(user.id));
      };


      if (event.target.closest('[data-sort]')) {
        const colName = event.target.closest('th').textContent.trim();
        console.log(colName);
        await this.backend.sort(colName);
        this.renderUsersTable();
      }
    });

    document.getElementById('si-add-user-form').addEventListener('submit', async (event) => {
      event.preventDefault();

      const options = {};
      options.name = document.getElementById('user-name').value;
      options.email = document.getElementById('user-email').value;
      options.description = document.getElementById('user-description').value;
      options.createdAt = new Date();

      await this.backend.create(options);
      await this.loadUsers();
      this.renderUsersTable();
      $('#modal-add-user').modal('hide');
    });

    document.getElementById('si-input-limit').addEventListener('change', async (event) => {
      this.limitTableRows = event.target.value;
      this.page = this.initPageIndex();
      await this.loadUsers();
      this.renderUsersTable();
      prev.setAttribute('disabled', 'disabled');
      if (this.users.length < this.limitTableRows) {
        next.setAttribute('disabled', 'disabled');
      }
    });
  }

  initPageIndex() {
      let currentPageOfTable = 1;
      return (step = 0) => {
        currentPageOfTable += step;
        return currentPageOfTable;
      }
  }

  async loadUsers() {
    const options = {};
    options.page = this.page();
    options.limit = this.limitTableRows;
    this.users = await this.backend.get(options);
  }

  async updateUser(id) {
    const user = await this.backend.get(id);
    return `
      <td colspan = '4'>
        <form class="form-inline">
          <input type="text" class="col form-control mb-2 mr-sm-2" name="name" value="${user.name}">
          <input type="email" class="col form-control mb-2 mr-sm-2" name="email" value="${user.email}">
          <textarea class="col form-control" name="description" rows="2">${user.description}</textarea>
        </form>
      </td>
      <td class="align-middle text-center">
        <button type="button" class="btn btn-outline-primary mb-2" data-update data-id="${id}">Update</button>
      </td>
    `;
  }

  renderUsersTable() {
    const users = this.users.map(user => `<tr>${this.renderUser(user)}</tr>`);

    document.querySelector('.si-users-table').innerHTML = `
      <table class="table table-striped table-sm">
        <thead class="thead-dark ">
          <tr>
            <th scope="col" class="align-middle text-center">
              name
              <button type="button" class="close" aria-label="Close" data-sort>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5" width="15" height="15">
                  <path fill="#ffffff" d='M2 0L0 2h4zm0 5L0 3h4z'/>
                </svg>
              </button>
            </th>
            <th scope="col" class="align-middle text-center">
              email
              <button type="button" class="close" aria-label="Close" data-sort>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5" width="15" height="15">
                  <path fill="#ffffff" d='M2 0L0 2h4zm0 5L0 3h4z'/>
                </svg>
              </button>
            </th>
            <th scope="col" class="align-middle text-center">
              description
              <button type="button" class="close" aria-label="Close" data-sort>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5" width="15" height="15">
                  <path fill="#ffffff" d='M2 0L0 2h4zm0 5L0 3h4z'/>
                </svg>
              </button>
            </th>
            <th scope="col" class="align-middle text-center">
              createdAt
              <button type="button" class="close" aria-label="Close" data-sort>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 5" width="15" height="15">
                  <path fill="#ffffff" d='M2 0L0 2h4zm0 5L0 3h4z'/>
                </svg>
              </button>
            </th>
            <th scope="col" class="align-middle text-center"></th>
          </tr>
        </thead>
        <tbody>
          ${users.join('')}
        </tbody>
      </table>`;
  }

  renderUser({id, name, email, description, createdAt}) {
    return `
      <td>${name}</td>
      <td>${email}</td>
      <td>${description}</td>
      <td>${createdAt}</td>
      <td>
        <button type="button" class="btn btn-outline-primary" data-edit data-id="${id}">Edit</button>
        <button type="button" class="btn btn-outline-danger" data-delete data-id="${id}">Delete</button>
      </td>`;
  }

  render() {
    document.body.innerHTML = `
      <div class="container">
        <div class="row">
          <div class="col-auto mr-auto">
            <div class="input-group">
              <div class="input-group-prepend">
                <label class="input-group-text" for="si-input-limit">Show</label>
              </div>
              <select class="custom-select" id="si-input-limit">
                <option value="10" selected>10</option>
                <option value="25">25</option>
                <option value="100">100</option>
              </select>
              <div class="input-group-append">
                <label class="input-group-text" for="si-input-limit">entries</label>
              </div>
            </div>
          </div>

          <div class="col-auto">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal-add-user">
              Add user
            </button>
            <div class="modal fade" id="modal-add-user" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="ModalLabel">Add user</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    
                    <form action="https://www.google.com/" id="si-add-user-form">
                      <div class="form-group">
                        <label for="user-name">User name</label>
                        <input name="name" type="text" class="form-control" id="user-name" placeholder="Enter name" value="Valentin">
                      </div>
                      <div class="form-group">
                        <label for="user-email">Email address</label>
                        <input name="email" type="email" class="form-control" id="user-email" placeholder="name@example.com" value="test@gmail.com">
                      </div>
                      <div class="form-group">
                        <label for="user-description">Description</label>
                        <textarea name="description" class="form-control" id="user-description" rows="4">test</textarea>
                      </div>
                      <div class="form-group">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">
                          Close
                        </button>
                        <button type="submit" class="btn btn-primary">
                          Add user
                        </button>
                      </div>
                    </form>

                  </div>
                  <div class="modal-footer">
                    
                  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-auto">
            <form class="form-inline">
              <input class="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search">
              <button class="btn btn-success my-2 my-sm-0" type="submit">Search</button>
            </form>
          </div>
        </div>

        <div class="row">
          <div class="col si-users-table my-2">
            <!-- Table content here -->
          </div>
        </div>

        <div class="row si-footer-table">
          <div class="col-auto ml-auto">
            <button type="button" class="btn btn-primary" data-preview>
              Preview
            </button>
            <button type="button" class="btn btn-primary" data-next>
              Next
            </button>
          </div>
        </div>
      </div>`;
  }

}