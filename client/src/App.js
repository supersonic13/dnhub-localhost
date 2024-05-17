import { RiArrowRightLine, RiSearch2Line } from "@remixicon/react";
import { Button, Card } from "@tremor/react";
export default function App() {
  return (
    <>
      <h3 className="text-xl text-green-600 underline">
        hello this is Irfan Habib
      </h3>
      <Button className="text-white ms-64 mt-2">Clickable Button</Button>
      <Card className="mx-auto max-w-xs" decoration="top" decorationColor="red">
        <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Sales and More
        </p>
        <p className="text-3xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">
          $34,743ssdf
        </p>
      </Card>
    </>
  );
}
