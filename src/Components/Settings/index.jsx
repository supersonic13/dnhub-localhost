import { Card } from "react-bootstrap";

export default function Content() {
  return (
    <Card className="h-100">
      <Card.Body>
        <h3 className="text-center mb-4">Bulk Who is Checker</h3>
        <ul>
          <li>
            <h6>Supporting hundreds of top-level-domains </h6>
          </li>
          <li>
            <h6>Check unlimited domains simultaneously </h6>
          </li>
          <li>
            <h6>Download the results in csv</h6>
          </li>
        </ul>
        <hr />
        <p className="alert bg-soft-info fw-normal">
          For best practice, if you have hundreds of domains to check, increase
          the <span className="fw-bold">wait time</span> to avoid ip blocking at
          whois server
        </p>
      </Card.Body>
    </Card>
  );
}
