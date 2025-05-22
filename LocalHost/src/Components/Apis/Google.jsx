import { Button, Chip, Divider, Input, Spacer } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function GoogleApi() {
  const [accessToken, setAccessToken] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [devToken, setDevToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refToken, setRefToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  // const token = JSON.parse(localStorage.getItem("lg_tk"));

  // this function will send the ads settings to the server
  const handleSave = (e) => {
    setLoading(true);
    axios
      .post("/api/apis/google", {
        accessToken,
        customerId,
        devToken,
        clientId,
        clientSecret,
        refToken,
      })
      .then((res) => {
        setLoading(false);
        toast(res.data?.message, { position: "bottom-right" });
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        toast.error("Some Error Occurred", { position: "bottom-right" });
      });
  };

  // this is to get the ads settings from the server
  useEffect(() => {
    axios.get("/api/apis/google").then((res) => {
      if (res.data) {
        setAccessToken(res.data?.accessToken);
        setCustomerId(res.data?.customerId);
        setDevToken(res.data?.devToken);
        setClientId(res.data?.clientId);
        setClientSecret(res.data?.clientSecret);
        setRefToken(res.data?.refToken);
      }
    });
  }, []);

  const generateToken = () => {
    setLoading2(true);
    axios
      .post("/api/apis/google/generate-token")
      .then((res) => {
        console.log(res.data);
        toast(res.data?.message, { position: "bottom-right" });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Some Error Occurred", { position: "bottom-right" });
      });
  };
  return (
    <div>
      <Toaster />
      <h4 className="text-xl font-semibold text-violet-700 mb-2">
        Google Ads API Settings
      </h4>

      <Divider />
      <Spacer y={2} />
      <Chip variant="flat" radius="sm" color={"secondary"}>
        If you disable, premium domains will not shown. Please refer to the
        documentation on how to get Sedo API for free.
      </Chip>
      <div>
        <Spacer y={2} />
        <Input
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          type="text"
          label="Access Token"
          placeholder="ya29.a0AW4XtxjBXySKvl2puz49SjqGSOp . . ."
        />
        <Spacer y={2} />
        <Input
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          type="text"
          label="Customer ID"
          placeholder="9665271493"
        />
        <Spacer y={2} />
        <Input
          value={devToken}
          onChange={(e) => setDevToken(e.target.value)}
          type="text"
          label="Developer Token"
          placeholder="Wvmer7gPaI2ZZaSuidrdevt"
        />
        <Spacer y={2} />
        <Input
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          type="text"
          label="Google Ads Client ID"
          placeholder="6007190274237-415qadu2ib5o0jls9gtnd7b2qofsncbe.apps.googleusercontent.com"
        />
        <Spacer y={2} />
        <Input
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          type="text"
          label="Google Ads Client Secret"
          placeholder="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"
        />
        <Spacer y={2} />
        <Input
          value={refToken}
          onChange={(e) => setRefToken(e.target.value)}
          type="text"
          label="Refresh Token"
          placeholder="1//0gI_WimgvWihyCgYIAR3AGBASNgF- . . ."
        />
        <Spacer y={2} />
        <Button
          // isDisabled
          size="md"
          color="success"
          variant="shadow"
          isLoading={loading2}
          onPress={generateToken}
        >
          Re Generate Token
        </Button>

        <Spacer y={4} />
        <Button
          // isDisabled
          size="md"
          color="secondary"
          variant="shadow"
          isLoading={loading}
          onPress={handleSave}
        >
          Save
        </Button>
      </div>
      {/* </CardBody> */}
    </div>
  );
}
