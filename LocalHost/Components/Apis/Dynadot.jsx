import { Button, Chip, Divider, Input, Spacer } from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function DynadotApi() {
  const [api, setApi] = useState("");
  // const [partnerId, setPartnerId] = useState("");
  const [loading, setLoading] = useState(false);
  // const token = JSON.parse(localStorage.getItem("lg_tk"));

  // this function will send the ads settings to the server
  const handleSave = (e) => {
    setLoading(true);
    axios
      .post("/api/apis/dynadot", {
        api,
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
    axios.get("/api/apis/dynadot").then((res) => {
      if (res.data) {
        setApi(res.data?.api);
        // setPartnerId(res.data?.partnerId);
      }
    });
  }, []);

  return (
    <div>
      <Toaster />
      <h4 className="text-xl font-semibold text-violet-700 mb-2">
        Dynadot API Settings
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
          value={api}
          onChange={(e) => setApi(e.target.value)}
          type="text"
          label="Dynadot API Key"
          placeholder="9F8y639W7M6P832chFy8sLy6y7f7CE9G8AY9kj8"
        />
        {/* <Spacer y={2} />
        <Input
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          type="text"
          label="Partner ID | CampaignID"
          placeholder="321234"
        /> */}

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
