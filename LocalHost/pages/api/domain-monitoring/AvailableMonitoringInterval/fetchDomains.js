import client from "../../../../db";
export default async function fetchDomains() {
  try {
    const domains = await client
      .db("localhost-server")
      .collection("available-monitoring")
      .find()
      .project({ _id: 0 })
      .toArray();
    return domains;
  } catch (error) {
    console.error("Error fetching domains:", error);
    return [];
  }
}
