const { hash, compare } = require("bcryptjs");
const AppError = require("../utils/AppError");
const sqliteConnection = require("../database/sqlite");

class UsersControllers {
  async create(request, response) {
    const { name, email, password } = request.body;

    const database = await sqliteConnection();

    const checkUersExists = await database.get("SELECT * FROM users WHERE email = (?)",[email]);

    if (checkUersExists) {
      throw new AppError(
        "Esse email já está cadastro bebe, tenta outro por favor <3"
      );
    }

    const hashedPassword = await hash(password, 8);

    await database.run(
      "INSERT INTO users (name, email, password) VALUES(?, ?, ?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;

    const { id } = request.params;

    const database = await sqliteConnection();

    const user = await database.get("SELECT * FROM users WHERE id = (?)", [id]);

    if (!user) {
      throw new AppError(
        "Não achei usuário ai não vacilão, tenta outro ai vai."
      );
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)",[email]);

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError(
        "Hum, parece que esse email já está sendo utilizado por outro usuário."
      );
    }

    user.name = name ?? user.name;
    user.email = email ?? user.email;

    if (password && !old_password) {
      throw new AppError(
        "Precisa informar a senha antiga para definir a nova senha"
      );
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError(
          "Vish, senha antiga não confere meu parceiro, esqueceu comédia? Ou está tentando roubar a conta de alguém?"
        );
      }

      user.password = await hash(password, 8);
    }

    await database.run(
      `
      UPDATE users SET
      name = ?,
      email = ?,
      password = ?,
      updated_at = DATETIME('now')
      WHERE id = ?`,
      [user.name, user.email, user.password, id]
    );

    return response.json();
  }
}

module.exports = UsersControllers;
