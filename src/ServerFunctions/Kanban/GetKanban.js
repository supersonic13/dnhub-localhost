const { client } = require("../../../db");

async function GetKanban(socket, data) {
  try {
    const kanbanCollection = client.db("local-host").collection("kanban-data");
    const res = await kanbanCollection.find({}).toArray();
    socket.emit("get-kanban-data", res);
  } catch (err) {
    console.log(err);
  }
}

module.exports = GetKanban;
