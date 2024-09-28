import {
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Input,
  Spacer,
} from "@nextui-org/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function GodaddyApi() {
  const [api, setApi] = useState("");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(false);
  // const token = JSON.parse(localStorage.getItem("lg_tk"));

  // this function will send the ads settings to the server
  const handleSave = (e) => {
    setLoading(true);
    axios
      .post("/api/apis/godaddy", {
        api,
        secret,
      })
      .then((res) => {
        setLoading(false);
        toast(res.data?.message, { position: "bottom-right" });
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Some Error Occurred", { position: "bottom-right" });
      });
  };

  // this is to get the ads settings from the server
  useEffect(() => {
    axios.get("/api/apis/godaddy").then((res) => {
      if (res.data) {
        setApi(res.data?.api);
        setSecret(res.data?.secret);
      }
    });
  }, []);

  return (
    <div>
      <Toaster />

      <h4 className="text-xl font-semibold text-violet-700 mb-2">
        Godaddy API Settings
      </h4>

      <Divider />

      <Spacer y={2} />
      <div>
        <Chip variant="flat" radius="sm" color={"secondary"}>
          Please refer to the documentation on how to get Godaddy API for free.
        </Chip>
        <Spacer y={2} />
        <Input
          value={api}
          onChange={(e) => setApi(e.target.value)}
          type="text"
          label="API Key"
          placeholder="A535djNWJjt_DrfBSPADvpceZtw7mu1hkn"
        />
        <Spacer y={2} />
        <Input
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          type="text"
          label="API Secret"
          placeholder="753LQ7yZ2Hxba4mrZcR9Br"
        />

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
    </div>
  );
}
