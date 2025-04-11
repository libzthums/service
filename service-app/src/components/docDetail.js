import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import axios from "axios";
import { UrlContext } from "../router/route";

export default function DocDetail() {
  const { serviceID } = useParams();
  const navigate = useNavigate();
  const { url } = useContext(UrlContext);

  const [prDocs, setPrDocs] = useState([]);
  const [poDocs, setPoDocs] = useState([]);
  const [contractDocs, setContractDocs] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const prResponse = await axios.get(`${url}docreader/pr/${serviceID}`);
        const poResponse = await axios.get(`${url}docreader/po/${serviceID}`);
        const contractResponse = await axios.get(
          `${url}docreader/contract/${serviceID}`
        );

        setPrDocs(prResponse.data);
        setPoDocs(poResponse.data);
        setContractDocs(contractResponse.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [serviceID, url]);

  return (
    <div className="p-4">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        ← Back
      </Button>
      <h2 className="mt-4 text-2xl font-semibold">Document View</h2>

      <Tabs
        defaultActiveKey="pr"
        id="uncontrolled-tab-example"
        className="mb-3"
        variant="pills">
        <Tab eventKey="pr" title="PR" disabled={prDocs.length === 0}>
          {prDocs.length > 0 ? (
            <ul>
              {prDocs.map((doc, index) => (
                <li key={index}>
                  <a
                    href={doc.DocPath}
                    target="_blank"
                    rel="noopener noreferrer">
                    {doc.DocName}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No PR documents available.</p>
          )}
        </Tab>

        <Tab eventKey="po" title="PO" disabled={poDocs.length === 0}>
          {poDocs.length > 0 ? (
            <ul>
              {poDocs.map((doc, index) => (
                <li key={index}>
                  <a
                    href={doc.DocPath}
                    target="_blank"
                    rel="noopener noreferrer">
                    {doc.DocName}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No PO documents available.</p>
          )}
        </Tab>

        <Tab
          eventKey="contract"
          title="Contract"
          disabled={contractDocs.length === 0}>
          {contractDocs.length > 0 ? (
            <ul>
              {contractDocs.map((doc, index) => (
                <li key={index}>
                  <a
                    href={doc.DocPath}
                    target="_blank"
                    rel="noopener noreferrer">
                    {doc.DocName}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No Contract documents available.</p>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
