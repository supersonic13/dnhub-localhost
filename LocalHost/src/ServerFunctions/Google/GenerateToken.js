const { default: axios } = require("axios");
const { connectToMongoDB } = require("../../../db");

async function refreshToken() {
  const { db } = await connectToMongoDB();
  const doc = await db.collection("google-api").findOne();

  if (!doc) {
    console.error("No Google API credentials found in DB.");
    return;
  }

  try {
    const response = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: doc.clientId,
      client_secret: doc.clientSecret,
      grant_type: "refresh_token",
      refresh_token: doc.refToken,
    });

    const result = await db
      .collection("google-api")
      .updateOne(
        {},
        { $set: { accessToken: response?.data?.access_token } },
        { upsert: true }
      );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      console.log({
        status: true,
        message: "Updated successfully",
      });
    } else {
      console.log({
        status: false,
        message:
          "Update was not successful. Data remains same. Please change some input.",
      });
    }
  } catch (err) {
    console.error(err);
    console.log({
      status: false,
      message: "Failed to update access token.",
    });
  }
}

function GenerateToken() {
  // Run immediately
  refreshToken();
  // Then every 45 minutes
  setInterval(refreshToken, 2700000);
}

module.exports = GenerateToken;
