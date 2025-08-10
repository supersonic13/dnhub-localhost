import {
  Button,
  Chip,
  Divider,
  Input,
  Spacer,
} from "@heroui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function NameCheapApi() {
  const [api, setApi] = useState("");
  const [userName, setUserName] = useState("");
  const [clientIp, setClientIp] = useState("");
  const [loading, setLoading] = useState(false);
  // const token = JSON.parse(localStorage.getItem("lg_tk"));

  // this function will send the ads settings to the server
  const handleSave = (e) => {
    setLoading(true);
    axios
      .post("/api/apis/namecheap", {
        api,
        userName,
        clientIp,
      })
      .then((res) => {
        setLoading(false);
        toast(res.data?.message, { position: "bottom-right" });
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
        toast.error("Some Error Occurred", {
          position: "bottom-right",
        });
      });
  };

  // this is to get the ads settings from the server
  useEffect(() => {
    axios.get("/api/apis/namecheap").then((res) => {
      if (res.data) {
        setApi(res.data?.api);
        setUserName(res.data?.userName);
        // setClientIp(res.data?.clientIp);
      }
    });
  }, []);
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => setClientIp(data?.ip));
  }, []);
  return (
    <div>
      <Toaster />
      <h4 className="text-xl font-semibold text-violet-700 mb-2">
        NameCheap API
      </h4>

      <Divider />
      <Spacer y={2} />

      <div className="sm:w-[50%]">
        <Input
          value={api}
          onChange={(e) => setApi(e.target.value)}
          type="text"
          label="API Key"
          placeholder="q1333c40a7d8c36941sd4262fb63rt"
        />
        <Spacer y={2} />
        <Input
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          type="text"
          label="NameCheap Account User Name"
          placeholder="johndoe"
        />
        <Spacer y={2} />
        <Input
          value={clientIp}
          onChange={(e) => setClientIp(e.target.value)}
          type="text"
          label="Client IP Address"
          placeholder="123.12.22.312"
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
      {/* </CardBody> */}
    </div>
  );
}
