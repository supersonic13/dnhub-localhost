import { client } from "../../../db";
export default async function MarketPlace(req, res) {
  try {
    switch (req.method) {
      case "POST":
        const sedoDomains = await client
          .db("localhost-server")
          .collection("sedo-domains")
          .find({})
          .toArray();

        res.json([...sedoDomains]);
    }
  } catch (error) {
    console.log(error);
  }
}
const config = {
  api: { externalResolver: true },
};
