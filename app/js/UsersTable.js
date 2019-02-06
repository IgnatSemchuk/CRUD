import {AppBackend} from './AppBackend.js';

export class UsersTable {

  constructor() {
    this.users = [];
    this.backend = new AppBackend('https://5bf417c491c25b0013a3b9a2.mockapi.io/users');
    this.page = this.initPage();
    this.limitRows;
  }

  async init() {
    this.render();
    this.limitRows = document.getElementById('si-input-limit').value;
    await this.loadUsers();
    this.renderUsersTable();

    const next = document.querySelector('[data-next]');
    const prev = document.querySelector('[data-preview]');
    
    document.addEventListener('click', async (event) => {
      if (event.target.matches('[data-preview]')) {
        if (next.hasAttribute('disabled')) {
          next.removeAttribute('disabled');
        };

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
        if (this.users.length < this.limitRows) {
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
        console.log('in');
        const editTableRow = event.target.closest('tr');
        const user = {};
        user.id = +event.target.dataset.id;
        user.name = editTableRow.querySelector('[name="name"]').value;
        user.email = editTableRow.querySelector('[name="email"]').value;
        user.description = editTableRow.querySelector('[name="description"]').value;
        user.createdAt = new Date();
        console.log(user);
        await this.backend.update(user);
        editTableRow.innerHTML = this.renderUser(user);
      };
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
    });

    document.getElementById('si-input-limit').addEventListener('change', async (event) => {
      this.limitRows = event.target.value;
      this.page = this.initPage();
      await this.loadUsers();
      this.renderUsersTable();
      if (!prev.hasAttribute('disabled')) {
        prev.setAttribute('disabled', 'disabled');
      };
      if (next.hasAttribute('disabled')) {
        next.removeAttribute('disabled');
      };
    });
  }

  initPage() {
      let page = 1;
      return (step = 0) => {
        page += step;
        return page;
      }
  }

  async loadUsers() {
    const options = {};
    options.page = this.page();
    options.limit = this.limitRows;
    console.log(options);
    this.users = await this.backend.get(options);
  }

  async updateUser(id) {
    const user = await this.backend.get(id);
    console.log(user);

    return `
      <td colspan = '4'>
        <form class="form-inline">
          <input type="text" class="col form-control mb-2 mr-sm-2" name="name" value="${user.name}">
          <input type="email" class="col form-control mb-2 mr-sm-2" name="email" value="${user.email}">
          <textarea class="col form-control" name="description" rows="2">${user.description}</textarea>
        </form>
      </td>
      <td class="align-middle p-auto">
        <button type="button" class="btn btn-outline-primary mb-2" data-update data-id="${id}">Update</button>
      </td>
    `;
  }

  renderUsersTable() {
    const users = this.users.map(user => `<tr>${this.renderUser(user)}</tr>`);

    document.querySelector('.si-users-table').innerHTML = `
      <table class="table table-striped table-sm">
        <thead class="thead-dark">
          <tr>
            <th scope="col">name</th>
            <th scope="col">email</th>
            <th scope="col">description</th>
            <th scope="col">createdAt</th>
            <th scope="col"></th>
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
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#Modal">
              Add user
            </button>
            <div class="modal fade" id="Modal" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="ModalLabel">Modal title</h5>
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
            <button type="button" class="btn btn-primary" data-preview disabled>
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