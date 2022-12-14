import { Textarea, Spinner } from "@chakra-ui/react";
import styles from "../styles/Home.module.css";
import { useState } from "react";
import getText from "./homePage/getText";

// import getText from "./getText";
// import Header from "./Header";
// import Footer from "./Footer";
// import { Link } from "react-router-dom";

export default function Home() {
  const [isSelected, setIsSelected] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  // const [extractedResumeText, setExtractedResumeText] = useState();
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
  //after upload, get file and display some data, remove possible errors
  const handleChange = (event) => {
    //to prevent typescript null value error
    if (!event.target.files) return;
    setError(null);
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  };
  //after submission, set output text and show error element if incorrect file format
  const handleSubmission = () => {
    getText(selectedFile).then(
      (text) => {
        // console.log(text)
        // setExtractedResumeText(text);
        // console.log(text);
        callGPT(text);
      },
      (error) => {
        console.error(error);
        setError(`File could not be uploaded due to this error: ${error}`);
      }
    );
  };

  async function callGPT(extractedResumeText) {
    // event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume: extractedResumeText,
          jobDescription: jobDescription,
        }),
      });
      const data = await response.json();
      // console.log(data.result);
      setCoverLetterText(data.result);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    // setModelOutput(data.result);
    // setPromptInput("");
  }

  const clearText = () => {
    setIsSelected(false);
    setExtractedText(null);
  };
  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText).catch(() => {
        alert("something went wrong");
      });
    }
  };

  return (
    <div className={styles.overallContainer}>
          <div className="row">
              <h1>Generate a Personalized Cover Letter</h1>
              <p>{`Upload Your Resume`}</p>
              <label className="custom-input">
                <input
                  type="file"
                  name="file"
                  data-testid="upload-input"
                  onChange={handleChange}
                  accept="application/pdf"
                />
                {/* Upload PDF to Extract Text */}
              </label>

              {isSelected && selectedFile ? (
                <div>
                  <br />
                  <p>
                    Filename: <strong>{selectedFile.name}</strong>
                  </p>{" "}
                  <p>
                    Filetype: <strong>{selectedFile.type}</strong>
                  </p>
                  <p>
                    Size in bytes: <strong>{selectedFile.size}</strong>
                  </p>
                </div>
              ) : (
                <p>{`Copy the job description below (optional)`}</p>
              )}
              <div>
                {loading ? (
                  <div className={styles.spinner}>
                    <Spinner />
                  </div>
                ) : (
                  <Textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    resize="horizontal"
                    placeholder=""
                    size="md"
                    minHeight="400px"
                  />
                )}
              </div>
              {error && <div>{error}</div>}

              <div>
                <button className="btn btn-primary" onClick={handleSubmission}>
                  Submit
                </button>
              </div>
      </div>
      <div>
        {coverLetterText && (
          <div className={styles.resultTextArea}>
            <div>
              <h4>Generated Cover Letter</h4>
              <Textarea
                id="resultTextArea"
                value={coverLetterText}
                // onChange={handleChange}
                resize="horizontal"
                placeholder={coverLetterText}
                size="md"
                minHeight="400px"
                minWidth="800px"
              />
            </div>
            <div className="parsed-text">
              <h4>Parsed Text</h4>
            </div>
            <div>
              <button
                className="btn btn-outline-secondary"
                onClick={copyToClipboard}
              >
                Copy to Clipboard
              </button>
            </div>
            <button className="btn btn-secondary" onClick={clearText}>
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
