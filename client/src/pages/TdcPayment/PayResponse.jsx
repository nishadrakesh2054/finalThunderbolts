import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./response.scss";
import Loading from "../../components/loading/Loading";
import { Alert, Container } from "react-bootstrap";

const PayResponse = () => {
    const navigate = useNavigate();
  const location = useLocation();
  const [responseMessage, setResponseMessage] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [details, setDetails] = useState(null);

  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/register");


  const isVerifyingRef = useRef(false);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const PRN = params.get("PRN");
    const PID = params.get("PID");
    const PS = params.get("PS");
    const RC = params.get("RC");

    const DV = params.get("DV");
    const UID = params.get("UID");
    const BC = params.get("BC");
    const INI = params.get("INI");
    const P_AMT = params.get("P_AMT");
    const R_AMT = params.get("R_AMT");



    // if (RC !== '00') {
    //     setResponseMessage(`Payment was not completed. (Code: ${RC})`);
    //     setIsSuccess(false);
    //     setRedirectUrl("/register");
    //     setShouldRedirect(true);
    //     return;
    //   }

     // Immediate check for failure/cancellation (from documentation)
     if (PS === "false" || RC !== "successful") {
        let message = "Payment failed";
        switch(RC) {
          case "01":
            message = "Payment was cancelled by user";
            break;
          case "02":
            message = "Payment timed out";
            break;
          case "03":
            message = "Invalid payment credentials";
            break;
          case "04":
            message = "Insufficient funds";
            break;
          default:
            message = `Payment failed (Code: ${RC})`;
        }
        
        setResponseMessage(message);
        setIsSuccess(false);
        setShouldRedirect(true);
        return;
      }
  
    const formData = sessionStorage.getItem("formData")
      ? JSON.parse(sessionStorage.getItem("formData"))
      : null;

    if (![PRN, PID, PS, RC, UID, BC, INI, P_AMT, R_AMT, DV].every(Boolean)) {
      setResponseMessage("Missing required parameters.");
      setIsSuccess(false);
      return;
    }

    const verifyPayment = async () => {
      if (isVerifyingRef.current) return;
      isVerifyingRef.current = true;
      setIsLoading(true);

      try {
        console.log("Sending request to backend:", {
          PRN: PRN.trim(),
          PID,
          PS,
          RC,
          UID,
          BC,
          INI,
          P_AMT,
          R_AMT,
          DV,
          formData,
        });

        const response = await axios.post(
          "/api/tdc/verify-payment",

          {
            PRN: PRN.trim(),
            PID,
            PS,
            RC,
            UID,
            BC,
            INI,
            P_AMT,
            R_AMT,
            DV,
            formData,
          }
        );

        console.log("Response data:", response.data);

        if (response.status === 200) {
          const { verified, message } = response.data;
          setIsVerified(verified);
          setResponseMessage(message);
          setDetails(response.data);
          setIsSuccess(verified);
        } else {
          setResponseMessage(`Payment verification failed: ${response.status}`);
          setIsSuccess(false);
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setResponseMessage("Payment verification failed. Please try again.");
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
        isVerifyingRef.current = false;
      }
    };

    const debouncedVerifyPayment = debounce(verifyPayment, 1000);
    debouncedVerifyPayment();
  }, [location.search]);


  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        navigate(redirectUrl, {
          state: { 
            paymentError: responseMessage,
            formData: sessionStorage.getItem("formData") 
              ? JSON.parse(sessionStorage.getItem("formData"))
              : null
          }
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, redirectUrl, responseMessage, navigate]);

  return (
    <div className="payment-reponse">
      {isLoading ? (
        <div className="loading-container">
          <Loading />
          <p className="loading-text">
            Processing your payment, please wait...
          </p>
        </div>
      ) : isSuccess ? (
        <Container>
          <h1>
            Thank you, <span>{details?.paymentDetails?.fullName}</span>!
          </h1>
          <p className="confirmation-message">
            Your registration has been successfully completed, and your payment
            has been received. You will shortly receive a confirmation email
            with further details.
          </p>

          <div className="box-to-details border">
            <h2 className="total-amount">
              Total Paid: NRP &nbsp;
              <strong>{details?.paymentDetails?.amount} /-</strong>
            </h2>
          </div>

          <p className="success-message">
            We look forward to seeing you at the academy. If you have any
            questions, please contact our team.
          </p>
        </Container>
      ) : (
        <Container>
          <Alert variant="danger" className="error-message">
            {responseMessage}
          </Alert>
        </Container>
      )}
    </div>
  );
};

export default PayResponse;
