import client from "../db.js";

export default async function GetKanban(socket, data) {
  await client
    .db("local-host")
    .collection("kanban-data")
    .find({})
    .toArray()
    .then((res) => socket.emit("get-kanban-data", res))
    .catch((err) => console.log(err));
}
