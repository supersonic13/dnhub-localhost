const { client } = require("../../../db");

async function SaveKanban(socket, data) {
  await client
    .db("local-host")
    .collection("kanban-data")
    .deleteMany({})
    .then((res) => console.log("deleted"))
    .catch((err) => console.log(err));

  await client
    .db("local-host")
    .collection("kanban-data")
    .insertMany(data)
    .then((res) => console.log("inserted"))
    .catch((err) => console.log(err));
}
module.exports = SaveKanban;
