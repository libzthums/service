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
        const response = await axios.get(`${url}document/${serviceID}`);
        setPrDocs(response.data.prDocs || []);
        setPoDocs(response.data.poDocs || []);
        setContractDocs(response.data.contractDocs || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, [serviceID, url]);

  let defaultTab = "pr";
if (prDocs.length > 0) {
  defaultTab = "pr";
} else if (poDocs.length > 0) {
  defaultTab = "po";
} else if (contractDocs.length > 0) {
  defaultTab = "contract";
}

  return (
    <div className="p-1 container">
      <Button variant="secondary" onClick={() => navigate(-1)}>
        <i className="fas fa-arrow-left"></i> Back
      </Button>
      <h2 className="mt-4 mb-4 text-2xl font-semibold">Document</h2>

      <Tabs defaultActiveKey={defaultTab} className="mb-3">
        <Tab
          eventKey="pr"
          title="PR"
          tabClassName={
            prDocs.length > 0
              ? "bg-primary"
              : "bg-secondary"
          }
          className="border-top border-bottom border-secondary border-2">
          {prDocs.length > 0 ? (
            <ul>
              {prDocs.map((doc, index) => (
                <li key={index}>
                  <a
                    href={encodeURI(doc.DocPath)}
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

        <Tab
          eventKey="po"
          title="PO"
          tabClassName={
            poDocs.length > 0
              ? "bg-primary"
              : "bg-secondary"
          }
          className="border-top border-bottom border-secondary border-2">
          {poDocs.length > 0 ? (
            <ul>
              {poDocs.map((doc, index) => (
                <li key={index}>
                  <a
                    href={encodeURI(doc.DocPath)}
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
          tabClassName={
            contractDocs.length > 0
              ? "bg-primary"
              : "bg-secondary"
          }
          className="border-top border-bottom border-secondary border-2"
          disabled={contractDocs.length === 0}>
          {contractDocs.length > 0 ? (
            <ul>
              {contractDocs.map((doc, index) => (
                <li key={index}>
                  <a
                    href={encodeURI(doc.DocPath)}
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
